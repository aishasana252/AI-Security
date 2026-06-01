-- APEXLyn Lens / AI DLP Platform Database Schema
-- Deploys all 65 relational tables in 9 domain-focused groups.
-- Implements Row-Level Security (RLS), custom indexing, and evidence immutability.

BEGIN;

-- ============================================================================
-- PREPARATION & EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- GLOBAL CONTEXT FUNCTION
-- ============================================================================
-- Extracts current tenant ID from session context 'app.current_tenant_id'
CREATE OR REPLACE FUNCTION get_current_tenant_id() RETURNS UUID AS $$
  SELECT NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;
$$ LANGUAGE sql STABLE;

-- Extracts current user ID from session context 'app.current_user_id'
CREATE OR REPLACE FUNCTION get_current_user_id() RETURNS UUID AS $$
  SELECT NULLIF(current_setting('app.current_user_id', true), '')::UUID;
$$ LANGUAGE sql STABLE;

-- Extracts support session elevated flag
CREATE OR REPLACE FUNCTION is_support_session_elevated() RETURNS BOOLEAN AS $$
  SELECT COALESCE(NULLIF(current_setting('app.support_session_elevated', true), '')::BOOLEAN, false);
$$ LANGUAGE sql STABLE;

-- ============================================================================
-- GROUP A: TENANT AND IDENTITY CORE
-- ============================================================================

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name VARCHAR(255) NOT NULL,
    tenant_type VARCHAR(50) NOT NULL, -- direct_smb, direct_mid_market, direct_enterprise, government, msp_partner, msp_client
    parent_msp_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    region VARCHAR(50) NOT NULL DEFAULT 'ap-southeast-2', -- AWS Sydney default
    isolation_level VARCHAR(50) NOT NULL DEFAULT 'shared', -- shared, dedicated, isolated
    key_ownership_state VARCHAR(50) NOT NULL DEFAULT 'apexlyn_managed', -- apexlyn_managed, tenant_dedicated, customer_cmk, agency_controlled
    industry VARCHAR(100),
    privacy_notice_acceptance_state VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, accepted, rejected
    ssl_inspection_consent_state VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, accepted, rejected
    deployment_mode VARCHAR(50) NOT NULL DEFAULT 'light_self_serve', -- light_self_serve, hosted_full, managed_full, enterprise_icap, enterprise_vpc, government_isolated
    lifecycle_state VARCHAR(50) NOT NULL DEFAULT 'active', -- active, grace, past_due, suspended, cancel_pending, terminated, read_only_exit, retained_only, purged
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tenant_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    domain_name VARCHAR(255) NOT NULL UNIQUE,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tenant_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
    settings_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    pseudonymized_id VARCHAR(255) NOT NULL, -- user_pseudo_id for outbound schemas
    email VARCHAR(255),
    department VARCHAR(100),
    role VARCHAR(50) NOT NULL, -- admin, investigator, analyst, operator, msp_admin, msp_operator, end_user
    risk_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    ueba_state JSONB NOT NULL DEFAULT '{}'::jsonb,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    seat_billable_state_ref VARCHAR(50) NOT NULL DEFAULT 'billable', -- billable, exempt_mailbox, exempt_service_account, dormant
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_tenant_pseudo UNIQUE (tenant_id, pseudonymized_id)
);

CREATE TABLE user_role_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    assigned_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mfa_verified BOOLEAN NOT NULL DEFAULT FALSE,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE mfa_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_type VARCHAR(50), -- totp, fido2, sms
    secret_key VARCHAR(255),
    backup_codes TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE support_access_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    support_user_reference VARCHAR(255) NOT NULL,
    session_start TIMESTAMPTZ NOT NULL,
    session_end TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    elevation_reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- GROUP B: BILLING AND COMMERCIAL
-- ============================================================================

CREATE TABLE billing_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    owner_type VARCHAR(50) NOT NULL, -- direct_customer, msp_partner, enterprise_contract, government_contract
    owner_reference VARCHAR(255),
    invoice_contact_email VARCHAR(255) NOT NULL,
    billing_name VARCHAR(255) NOT NULL,
    billing_address TEXT NOT NULL,
    tax_id VARCHAR(100),
    tax_jurisdiction VARCHAR(50), -- e.g., AU, US, EU
    payment_method_status VARCHAR(50) NOT NULL DEFAULT 'valid', -- valid, expired, failed
    account_status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, delinquent, closed
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_name VARCHAR(255) NOT NULL,
    plan_family VARCHAR(100) NOT NULL, -- APEXLyn Light, APEXLyn Control, APEXLyn Evidence, etc.
    channel_type VARCHAR(50) NOT NULL, -- direct, msp, enterprise_contract, government_contract
    deployment_mode VARCHAR(50) NOT NULL, -- light_self_serve, hosted_full, etc.
    base_price NUMERIC(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'AUD', -- Australian currency public default
    included_seats INTEGER NOT NULL DEFAULT 5,
    seat_overage_price NUMERIC(10,2) NOT NULL,
    billing_cycle_options VARCHAR(50)[] NOT NULL, -- monthly, annual
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    default_retention_profile_id UUID, -- self-referencing to retention_profiles created later
    support_profile_id UUID,
    default_entitlement_set_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    billing_account_id UUID NOT NULL REFERENCES billing_accounts(id),
    plan_id UUID NOT NULL REFERENCES plans(id),
    status VARCHAR(50) NOT NULL, -- draft, pending_payment, active, grace, past_due, suspended, cancel_pending, terminated
    billing_cycle VARCHAR(50) NOT NULL, -- monthly, annual
    next_renewal_date TIMESTAMPTZ NOT NULL,
    grace_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    contract_reference VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE subscription_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    addon_code VARCHAR(100) NOT NULL, -- endpoint_agent, extended_retention_pack, additional_webhook_pack, etc.
    quantity INTEGER NOT NULL DEFAULT 1,
    base_price NUMERIC(10,2) NOT NULL,
    effective_from TIMESTAMPTZ NOT NULL,
    effective_to TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE entitlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    feature_code VARCHAR(100) NOT NULL, -- browser_extension, endpoint_agent, forensic_workspace, etc.
    allowed BOOLEAN NOT NULL DEFAULT TRUE,
    limits JSONB DEFAULT '{}'::jsonb, -- dynamic expansion limits or count limits
    effective_from TIMESTAMPTZ NOT NULL,
    effective_to TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE seat_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seat_status VARCHAR(50) NOT NULL, -- active, pending_removal, deactivated
    seat_type VARCHAR(50) NOT NULL, -- named_user, admin_exempt
    billable BOOLEAN NOT NULL DEFAULT TRUE,
    billable_from TIMESTAMPTZ NOT NULL,
    billable_to TIMESTAMPTZ,
    activation_reason VARCHAR(255),
    deactivation_reason VARCHAR(255),
    seat_source VARCHAR(100) NOT NULL, -- manual, directory_sync, self_onboard
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    billing_account_id UUID NOT NULL REFERENCES billing_accounts(id),
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    invoice_date TIMESTAMPTZ NOT NULL,
    billing_period_start TIMESTAMPTZ NOT NULL,
    billing_period_end TIMESTAMPTZ NOT NULL,
    base_amount NUMERIC(10,2) NOT NULL,
    gst_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00, -- Handling AU GST separately
    total_amount NUMERIC(10,2) NOT NULL,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid', -- unpaid, paid, overdue, voided
    payment_due_date TIMESTAMPTZ NOT NULL,
    payment_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL,
    gst_applicable BOOLEAN NOT NULL DEFAULT TRUE,
    gst_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    line_total NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tax_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    tax_name VARCHAR(100) NOT NULL DEFAULT 'GST',
    tax_rate NUMERIC(5,2) NOT NULL DEFAULT 10.00, -- 10% standard AU GST
    country VARCHAR(2) NOT NULL DEFAULT 'AU',
    state VARCHAR(50),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    billing_account_id UUID NOT NULL REFERENCES billing_accounts(id),
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL, -- charge_succeeded, charge_failed, refund_succeeded
    gateway VARCHAR(50) NOT NULL DEFAULT 'stripe',
    transaction_reference VARCHAR(255) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'AUD',
    raw_response JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE partner_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE, -- the MSP partner's tenant record
    contract_reference VARCHAR(255) NOT NULL,
    partner_tier VARCHAR(50) NOT NULL, -- silver, gold, platinum
    discount_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    minimum_seat_commitment INTEGER NOT NULL DEFAULT 0,
    effective_from TIMESTAMPTZ NOT NULL,
    effective_to TIMESTAMPTZ,
    contract_terms TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE enterprise_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE, -- the Enterprise tenant record
    contract_reference VARCHAR(255) NOT NULL,
    annual_contract_value_floor NUMERIC(12,2) NOT NULL, -- ACV floor
    included_seat_floor INTEGER NOT NULL DEFAULT 100,
    extra_seat_price NUMERIC(10,2) NOT NULL,
    implementation_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    payment_schedule_terms VARCHAR(100) NOT NULL, -- upfront_annual, quarterly_invoice
    po_reference VARCHAR(100),
    renewal_tracking_state VARCHAR(50) NOT NULL DEFAULT 'active',
    effective_from TIMESTAMPTZ NOT NULL,
    effective_to TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- GROUP C: ONBOARDING AND LIFECYCLE
-- ============================================================================

CREATE TABLE onboarding_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
    current_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, ongoing, gate_review, completed, blocked
    onboarding_path VARCHAR(50) NOT NULL, -- direct_light, direct_control, full_hosted, managed_full, msp_partner, enterprise_icap
    completed_steps_count INTEGER NOT NULL DEFAULT 0,
    total_steps_count INTEGER NOT NULL,
    blocked_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE onboarding_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    step_code VARCHAR(100) NOT NULL, -- domain_verification, subscription_linkage, connector_auth, browser_extension_deploy, policy_selection, gate_approval
    step_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, skipped, completed, failed
    completed_by UUID REFERENCES users(id),
    completed_at TIMESTAMPTZ,
    step_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_tenant_step UNIQUE (tenant_id, step_code)
);

CREATE TABLE onboarding_artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    artifact_type VARCHAR(100) NOT NULL, -- dns_record_proof, saml_metadata, tenant_logo, msp_agreement
    object_storage_url VARCHAR(1024) NOT NULL,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE lifecycle_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
    previous_state VARCHAR(50),
    current_state VARCHAR(50) NOT NULL DEFAULT 'onboarding', -- onboarding, active, grace, suspended, read_only_exit, export_window, retained_only, purged
    grace_period_ends TIMESTAMPTZ,
    export_window_ends TIMESTAMPTZ,
    retention_period_ends TIMESTAMPTZ,
    state_changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cancellation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES users(id),
    reason TEXT,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processing_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, approved, scheduled, executed, rejected
    offboarding_effective_date TIMESTAMPTZ NOT NULL,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ
);

CREATE TABLE export_windows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    window_start TIMESTAMPTZ NOT NULL,
    window_end TIMESTAMPTZ NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    authorized_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE purge_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    job_status VARCHAR(50) NOT NULL DEFAULT 'queued', -- queued, running, completed, failed
    data_deleted_size_bytes BIGINT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_log TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE direct_conversion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE, -- the client tenant
    parent_msp_id UUID NOT NULL REFERENCES tenants(id), -- the departing MSP partner
    requested_by UUID NOT NULL REFERENCES users(id),
    conversion_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, approved, processed, rejected
    proposed_billing_account_data JSONB NOT NULL,
    billing_created_subscription_id UUID,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- GROUP D: POLICY AND TEMPLATES
-- ============================================================================

CREATE TABLE policy_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    source VARCHAR(100) NOT NULL DEFAULT 'portal', -- portal, api, cloned_from_msp
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, awaiting_approval, active, rolled_back, archived
    created_by UUID NOT NULL REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    effective_at TIMESTAMPTZ,
    rollback_source_id UUID REFERENCES policy_sets(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_tenant_version UNIQUE (tenant_id, version)
);

CREATE TABLE policy_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_set_id UUID NOT NULL REFERENCES policy_sets(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    rule_name VARCHAR(255) NOT NULL,
    priority INTEGER NOT NULL DEFAULT 100,
    conditions JSONB NOT NULL DEFAULT '{}'::jsonb, -- policy condition dimensions: dataclass, destination tier, device posture, time, etc.
    action VARCHAR(50) NOT NULL, -- allow, allow_with_audit, warn, redact, educate, block
    severity VARCHAR(50) NOT NULL DEFAULT 'low', -- informational, low, medium, high, critical
    justification_required BOOLEAN NOT NULL DEFAULT FALSE,
    escalation_flags JSONB NOT NULL DEFAULT '{}'::jsonb,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE policy_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(255) NOT NULL,
    industry_type VARCHAR(100) NOT NULL, -- finance, healthcare, government, general
    version VARCHAR(50) NOT NULL DEFAULT '1.0',
    template_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
    change_log TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE policy_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    policy_set_id UUID NOT NULL REFERENCES policy_sets(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL REFERENCES users(id),
    approval_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    approval_timestamp TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE policy_change_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    policy_set_id UUID NOT NULL REFERENCES policy_sets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    change_description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE policy_distribution_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    policy_set_id UUID NOT NULL REFERENCES policy_sets(id) ON DELETE CASCADE,
    enforcement_layer VARCHAR(100) NOT NULL, -- network_gateway, endpoint_agent, browser_extension, api_interceptor, cloud_connector
    distribution_state VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, distributed, active, failed
    last_distributed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- GROUP E: CONNECTORS AND INTEGRATIONS
-- ============================================================================

CREATE TABLE connectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    provider_name VARCHAR(100) NOT NULL, -- microsoft_365, google_workspace, icap, hosted_gateway, endpoint_agent
    display_name VARCHAR(255) NOT NULL,
    connection_status VARCHAR(50) NOT NULL DEFAULT 'disconnected', -- disconnected, connected, degraded, unauthorized, rate_limited
    consent_state VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, accepted, rejected
    last_sync_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE connector_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    connector_id UUID NOT NULL REFERENCES connectors(id) ON DELETE CASCADE UNIQUE,
    access_token TEXT,
    refresh_token TEXT,
    token_metadata JSONB DEFAULT '{}'::jsonb,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE connector_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    connector_id UUID NOT NULL REFERENCES connectors(id) ON DELETE CASCADE UNIQUE,
    health_status VARCHAR(50) NOT NULL DEFAULT 'healthy', -- healthy, degraded, error
    webhook_health VARCHAR(50) NOT NULL DEFAULT 'unknown',
    event_ingestion_delay_seconds INTEGER DEFAULT 0,
    throttled_state BOOLEAN NOT NULL DEFAULT FALSE,
    reauth_required BOOLEAN NOT NULL DEFAULT FALSE,
    last_success_time TIMESTAMPTZ,
    last_error_time TIMESTAMPTZ,
    last_error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE connector_sync_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    connector_id UUID NOT NULL REFERENCES connectors(id) ON DELETE CASCADE,
    run_status VARCHAR(50) NOT NULL DEFAULT 'running', -- running, completed, failed
    items_processed INTEGER NOT NULL DEFAULT 0,
    dlp_events_generated INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    error_details TEXT
);

CREATE TABLE connector_event_ingest_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    connector_id UUID NOT NULL REFERENCES connectors(id) ON DELETE CASCADE,
    external_event_id VARCHAR(255) NOT NULL, -- deduplication context
    ingestion_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processing_status VARCHAR(50) NOT NULL DEFAULT 'received', -- received, classified, error
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE outbound_destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    destination_type VARCHAR(100) NOT NULL, -- webhook_export, siem_export, splunk, datadog
    endpoint_url VARCHAR(1024) NOT NULL,
    auth_configuration JSONB DEFAULT '{}'::jsonb,
    delivery_format VARCHAR(50) NOT NULL DEFAULT 'json_standard', -- standard outbound logical event model schema
    retry_policy JSONB DEFAULT '{}'::jsonb,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- GROUP F: EVIDENCE AND EVENTS (APPEND-ONLY)
-- ============================================================================

CREATE TABLE dlp_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source_layer VARCHAR(100) NOT NULL, -- network_gateway, endpoint_agent, browser_extension, api_interceptor, cloud_connector, ai_output_dlp, inbound_llm_protection
    destination VARCHAR(1024) NOT NULL, -- SaaS destination / LLM endpoint / URL
    tool_category VARCHAR(100),
    action VARCHAR(50) NOT NULL, -- allow, allow_with_audit, warn, redact, educate, block
    severity VARCHAR(50) NOT NULL, -- informational, low, medium, high, critical
    data_classes VARCHAR(255)[] NOT NULL DEFAULT '{}', -- classified sensitive labels e.g., PII, PHI, PCI, source_code
    confidence NUMERIC(5,2), -- AI classification confidence score
    policy_id UUID REFERENCES policy_rules(id) ON DELETE SET NULL,
    policy_version INTEGER,
    output_event BOOLEAN NOT NULL DEFAULT FALSE,
    injection_detected BOOLEAN NOT NULL DEFAULT FALSE,
    linked_event_id UUID, -- self-referencing to couple multi-turn interactions
    input_hash VARCHAR(64),
    response_hash VARCHAR(64),
    degraded_mode BOOLEAN NOT NULL DEFAULT FALSE,
    retention_profile_id UUID, -- reference to retention_profiles created later
    evidence_chain_block_id UUID, -- Cryptographic link to ledger entry
    image_processed BOOLEAN NOT NULL DEFAULT FALSE,
    user_pseudo_id VARCHAR(255) NOT NULL,
    user_risk_score NUMERIC(5,2),
    ueba_anomaly_score NUMERIC(5,2),
    device_type VARCHAR(100)
);

CREATE TABLE evidence_chain_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    block_index BIGINT NOT NULL,
    previous_block_hash VARCHAR(64) NOT NULL,
    block_hash VARCHAR(64) NOT NULL UNIQUE,
    data_payload_hash VARCHAR(64) NOT NULL,
    digital_signature TEXT NOT NULL,
    rfc3161_timestamp_token BYTEA,
    rfc3161_timestamp_status VARCHAR(50) NOT NULL DEFAULT 'verified',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_tenant_block UNIQUE (tenant_id, block_index)
);

-- Circular FK reference resolve
ALTER TABLE dlp_events ADD CONSTRAINT fk_evidence_block FOREIGN KEY (evidence_chain_block_id) REFERENCES evidence_chain_blocks(id);

CREATE TABLE evidence_verification_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    verification_run_id VARCHAR(255) NOT NULL,
    chain_verification_status VARCHAR(50) NOT NULL, -- verified, tamper_detected, error
    timestamp_validation_status VARCHAR(50) NOT NULL, -- verified, invalid
    manifest_status VARCHAR(50) NOT NULL, -- complete, discrepancies
    tamper_detected BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    verified_blocks_count INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE event_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    parent_event_id UUID NOT NULL REFERENCES dlp_events(id),
    child_event_id UUID NOT NULL REFERENCES dlp_events(id),
    relationship_type VARCHAR(100) NOT NULL, -- multi_turn_context, file_extraction, prompt_response_link
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE redaction_maps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES dlp_events(id) ON DELETE CASCADE,
    original_text_masked VARCHAR(512) NOT NULL,
    redacted_replacement VARCHAR(512) NOT NULL,
    data_class_label VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE temporary_quarantine_objects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES dlp_events(id) ON DELETE CASCADE UNIQUE,
    object_storage_path VARCHAR(1024) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    quarantine_status VARCHAR(50) NOT NULL DEFAULT 'quarantined', -- quarantined, released, purged, override_approved
    released_by UUID REFERENCES users(id),
    released_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE evidence_export_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES dlp_events(id) ON DELETE CASCADE,
    export_record_id UUID NOT NULL, -- references export_records created later
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- GROUP G: FORENSIC WORKSPACE
-- ============================================================================

CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'open', -- open, in_review, escalated, hold_applied, export_preparing, closed
    severity VARCHAR(50) NOT NULL DEFAULT 'low', -- low, medium, high, critical
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    hold_id UUID, -- references legal_holds created later
    export_ids UUID[] DEFAULT '{}',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE case_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES dlp_events(id) ON DELETE CASCADE,
    added_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_case_event UNIQUE (case_id, event_id)
);

CREATE TABLE case_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    note_content TEXT NOT NULL,
    written_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE case_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    status_change_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE forensic_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    query_name VARCHAR(255) NOT NULL,
    query_definition JSONB NOT NULL DEFAULT '{}'::jsonb, -- structured filter criteria
    saved_by UUID REFERENCES users(id) ON DELETE CASCADE,
    natural_language_prompt TEXT, -- prompt that built the query
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES users(id),
    verification_type VARCHAR(100) NOT NULL, -- single_event_hash, full_ledger_check, case_manifest_verify
    verification_scope JSONB NOT NULL DEFAULT '{}'::jsonb,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, executing, succeeded, failed
    result_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- GROUP H: LEGAL HOLD AND RETENTION
-- ============================================================================

CREATE TABLE retention_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    profile_name VARCHAR(255) NOT NULL, -- e.g., Light, Control, Enterprise, Government
    retention_period_months INTEGER NOT NULL, -- 24, 60, 84, etc.
    custom_retention_override BOOLEAN NOT NULL DEFAULT FALSE,
    encryption_enforced BOOLEAN NOT NULL DEFAULT TRUE,
    purge_policy TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Update plans default retention references
ALTER TABLE plans ADD CONSTRAINT fk_default_retention FOREIGN KEY (default_retention_profile_id) REFERENCES retention_profiles(id) ON DELETE SET NULL;
ALTER TABLE dlp_events ADD CONSTRAINT fk_dlp_event_retention FOREIGN KEY (retention_profile_id) REFERENCES retention_profiles(id) ON DELETE SET NULL;

CREATE TABLE legal_holds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    hold_type VARCHAR(50) NOT NULL, -- case_hold, tenant_hold, external_hold
    matter_name VARCHAR(255) NOT NULL,
    matter_reference VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    scope_definition JSONB NOT NULL DEFAULT '{}'::jsonb, -- structured target scope criteria
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    review_at TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    release_approved_by UUID REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, released, pending_release
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE cases ADD CONSTRAINT fk_case_hold FOREIGN KEY (hold_id) REFERENCES legal_holds(id) ON DELETE SET NULL;

CREATE TABLE legal_hold_scopes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    hold_id UUID NOT NULL REFERENCES legal_holds(id) ON DELETE CASCADE,
    target_type VARCHAR(100) NOT NULL, -- user_id, user_pseudo_id, case_id, event_id
    target_value VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE retention_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    job_status VARCHAR(50) NOT NULL DEFAULT 'scheduled', -- scheduled, running, completed, skipped, failed
    retention_profile_id UUID NOT NULL REFERENCES retention_profiles(id),
    events_evaluated INTEGER DEFAULT 0,
    events_purged INTEGER DEFAULT 0,
    events_exempt_held INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE deletion_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    job_status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
    request_source VARCHAR(100) NOT NULL DEFAULT 'cancellation', -- user_request, offboarding, purge
    entities_purged_count INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE backup_exemption_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    exemption_reason VARCHAR(255) NOT NULL,
    evidence_manifest_hash VARCHAR(64) NOT NULL,
    authorized_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- GROUP I: PORTAL AND SUPPORT AUDIT
-- ============================================================================

CREATE TABLE platform_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- Nullable for global platform admin logs
    actor_type VARCHAR(50) NOT NULL, -- user, support_agent, automated_system
    actor_reference VARCHAR(255) NOT NULL, -- email, user_id, support_worker_id
    action VARCHAR(255) NOT NULL, -- policy_change, export_request, user_login, hold_released
    resource_type VARCHAR(100) NOT NULL, -- policy, case, user, billing
    resource_id VARCHAR(255),
    request_source VARCHAR(100) NOT NULL, -- portal, public_api, console
    ip VARCHAR(45) NOT NULL,
    session_id UUID,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    result VARCHAR(50) NOT NULL DEFAULT 'success', -- success, failed, denied
    details_summary TEXT NOT NULL
);

CREATE TABLE support_access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    support_worker_id VARCHAR(255) NOT NULL,
    request_reason TEXT NOT NULL,
    requested_duration_hours INTEGER NOT NULL DEFAULT 1,
    request_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, approved, rejected, expired
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE support_access_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    request_id UUID NOT NULL REFERENCES support_access_requests(id) ON DELETE CASCADE UNIQUE,
    approved_by UUID NOT NULL REFERENCES users(id),
    approval_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    escalation_tier VARCHAR(50) NOT NULL DEFAULT 'standard', -- standard, break_glass
    approval_notes TEXT
);

CREATE TABLE support_access_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES support_access_sessions(id) ON DELETE CASCADE,
    accessed_resource_type VARCHAR(100) NOT NULL,
    accessed_resource_id VARCHAR(255),
    action_taken VARCHAR(100) NOT NULL, -- read, write, export
    action_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE portal_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Null means broadcast to all tenant admins
    notification_title VARCHAR(255) NOT NULL,
    notification_body TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL DEFAULT 'info', -- info, warning, error
    read_state BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE customer_acknowledgements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_code VARCHAR(100) NOT NULL, -- privacy_notice, ssl_consent, employee_notice_template
    document_version VARCHAR(50) NOT NULL,
    timestamped_acceptance TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- EXPORT RECORDS TABLE (Resolving reference in Group F & G)
-- ============================================================================

CREATE TABLE export_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES users(id),
    export_type VARCHAR(100) NOT NULL, -- billing, policy, audit, event_summary, case_bundle, evidence_verification, compliance
    scope JSONB NOT NULL DEFAULT '{}'::jsonb, -- structured description of the exported scope (time-range, filters)
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, queued, building, awaiting_approval, completed, failed, expired
    download_count INTEGER NOT NULL DEFAULT 0,
    legal_hold_interaction VARCHAR(100) NOT NULL DEFAULT 'none', -- none, blocked_by_hold, hold_flagged
    approval_required BOOLEAN NOT NULL DEFAULT FALSE,
    approved_by UUID REFERENCES users(id),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key constraint to temporary references
ALTER TABLE evidence_export_references ADD CONSTRAINT fk_evidence_export_rec FOREIGN KEY (export_record_id) REFERENCES export_records(id) ON DELETE CASCADE;

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES ON ALL TENANT-AWARE TABLES
-- ============================================================================

-- Function to apply RLS policy to a table
CREATE OR REPLACE PROCEDURE enable_rls_on_table(table_name_param TEXT) AS $$
BEGIN
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', table_name_param);
  EXECUTE format(
    'CREATE POLICY tenant_isolation ON %I FOR ALL USING (tenant_id = get_current_tenant_id() OR (is_support_session_elevated() = true));',
    table_name_param
  );
END;
$$ LANGUAGE plpgsql;

-- Apply RLS to all tenant-aware tables carrying tenant_id
CALL enable_rls_on_table('tenant_domains');
CALL enable_rls_on_table('tenant_settings');
CALL enable_rls_on_table('users');
CALL enable_rls_on_table('user_role_assignments');
CALL enable_rls_on_table('sessions');
CALL enable_rls_on_table('mfa_state');
CALL enable_rls_on_table('support_access_sessions');
CALL enable_rls_on_table('billing_accounts');
CALL enable_rls_on_table('subscriptions');
CALL enable_rls_on_table('subscription_addons');
CALL enable_rls_on_table('entitlements');
CALL enable_rls_on_table('seat_ledger');
CALL enable_rls_on_table('invoices');
CALL enable_rls_on_table('invoice_line_items');
CALL enable_rls_on_table('tax_profiles');
CALL enable_rls_on_table('payment_events');
CALL enable_rls_on_table('partner_contracts');
CALL enable_rls_on_table('enterprise_contracts');
CALL enable_rls_on_table('onboarding_states');
CALL enable_rls_on_table('onboarding_steps');
CALL enable_rls_on_table('onboarding_artifacts');
CALL enable_rls_on_table('lifecycle_states');
CALL enable_rls_on_table('cancellation_requests');
CALL enable_rls_on_table('export_windows');
CALL enable_rls_on_table('purge_jobs');
CALL enable_rls_on_table('direct_conversion_requests');
CALL enable_rls_on_table('policy_sets');
CALL enable_rls_on_table('policy_rules');
CALL enable_rls_on_table('policy_approvals');
CALL enable_rls_on_table('policy_change_log');
CALL enable_rls_on_table('policy_distribution_status');
CALL enable_rls_on_table('connectors');
CALL enable_rls_on_table('connector_tokens');
CALL enable_rls_on_table('connector_health');
CALL enable_rls_on_table('connector_sync_runs');
CALL enable_rls_on_table('connector_event_ingest_log');
CALL enable_rls_on_table('outbound_destinations');
CALL enable_rls_on_table('dlp_events');
CALL enable_rls_on_table('evidence_chain_blocks');
CALL enable_rls_on_table('evidence_verification_runs');
CALL enable_rls_on_table('event_links');
CALL enable_rls_on_table('redaction_maps');
CALL enable_rls_on_table('temporary_quarantine_objects');
CALL enable_rls_on_table('evidence_export_references');
CALL enable_rls_on_table('cases');
CALL enable_rls_on_table('case_events');
CALL enable_rls_on_table('case_notes');
CALL enable_rls_on_table('case_status_history');
CALL enable_rls_on_table('forensic_queries');
CALL enable_rls_on_table('verification_requests');
CALL enable_rls_on_table('retention_profiles');
CALL enable_rls_on_table('legal_holds');
CALL enable_rls_on_table('legal_hold_scopes');
CALL enable_rls_on_table('retention_jobs');
CALL enable_rls_on_table('deletion_jobs');
CALL enable_rls_on_table('backup_exemption_records');
CALL enable_rls_on_table('platform_audit_log');
CALL enable_rls_on_table('support_access_requests');
CALL enable_rls_on_table('support_access_approvals');
CALL enable_rls_on_table('support_access_history');
CALL enable_rls_on_table('portal_notifications');
CALL enable_rls_on_table('customer_acknowledgements');
CALL enable_rls_on_table('export_records');

-- ============================================================================
-- HIGH-PERFORMANCE INDEXES (Clause 11.7)
-- ============================================================================
-- Indexes for primary portal queries and relationship audits
CREATE INDEX idx_dlp_events_tenant_time ON dlp_events(tenant_id, event_timestamp DESC);
CREATE INDEX idx_dlp_events_tenant_user ON dlp_events(tenant_id, user_id);
CREATE INDEX idx_dlp_events_tenant_severity ON dlp_events(tenant_id, severity);
CREATE INDEX idx_dlp_events_tenant_action ON dlp_events(tenant_id, action);
CREATE INDEX idx_dlp_events_tenant_dest ON dlp_events(tenant_id, destination);
CREATE INDEX idx_dlp_events_linked ON dlp_events(linked_event_id) WHERE linked_event_id IS NOT NULL;

CREATE INDEX idx_case_events_lookup ON case_events(tenant_id, case_id, event_id);
CREATE INDEX idx_support_access_history_tenant ON support_access_history(tenant_id, session_id);
CREATE INDEX idx_invoices_billing_account ON invoices(tenant_id, billing_account_id);
CREATE INDEX idx_lifecycle_onboarding_tenant ON onboarding_states(tenant_id);
CREATE INDEX idx_legal_holds_tenant ON legal_holds(tenant_id, status);

-- ============================================================================
-- EVIDENCE IMMUTABILITY PROTECTION TRIGGERS (Clause 11.10)
-- ============================================================================

CREATE OR REPLACE FUNCTION block_immutable_modification() RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'IMMEDIATE HALT: Mutation of append-only forensic evidence is prohibited.';
END;
$$ LANGUAGE plpgsql;

-- Protect dlp_events from UPDATE or DELETE
CREATE TRIGGER trg_ensure_dlp_events_immutable
    BEFORE UPDATE OR DELETE ON dlp_events
    FOR EACH ROW EXECUTE FUNCTION block_immutable_modification();

-- Protect evidence_chain_blocks from UPDATE or DELETE
CREATE TRIGGER trg_ensure_evidence_chain_blocks_immutable
    BEFORE UPDATE OR DELETE ON evidence_chain_blocks
    FOR EACH ROW EXECUTE FUNCTION block_immutable_modification();

-- Protect platform_audit_log from UPDATE or DELETE
CREATE TRIGGER trg_ensure_audit_log_immutable
    BEFORE UPDATE OR DELETE ON platform_audit_log
    FOR EACH ROW EXECUTE FUNCTION block_immutable_modification();

COMMIT;
