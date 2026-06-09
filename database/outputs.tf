output "rds_endpoint" {
  description = "The connection endpoint for the RDS instance"
  value       = aws_db_instance.postgres.endpoint
}

output "rds_address" {
  description = "The address of the RDS instance"
  value       = aws_db_instance.postgres.address
}
