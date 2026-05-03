# Terraform config for MyDailyTools on AWS.
# Provisions: S3 bucket, CloudFront distribution with OAC, ACM cert, Route 53 records.
#
# Usage:
#   terraform init
#   terraform apply -var="domain=mydailytool.com" -var="hosted_zone_id=Z0123456789"
#
# Note: ACM for CloudFront must live in us-east-1, hence the aliased provider.

terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}

variable "domain"          { type = string }
variable "hosted_zone_id"  { type = string }
variable "aws_region"      { type = string  default = "us-east-1" }

provider "aws" { region = var.aws_region }
provider "aws" { alias = "us_east_1" region = "us-east-1" }

# --- S3 bucket (private, OAC-only access) ---
resource "aws_s3_bucket" "site" {
  bucket = var.domain
}

resource "aws_s3_bucket_public_access_block" "site" {
  bucket                  = aws_s3_bucket.site.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# --- ACM cert (must be us-east-1 for CloudFront) ---
resource "aws_acm_certificate" "cert" {
  provider          = aws.us_east_1
  domain_name       = var.domain
  subject_alternative_names = ["www.${var.domain}"]
  validation_method = "DNS"
  lifecycle { create_before_destroy = true }
}

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name = dvo.resource_record_name, value = dvo.resource_record_value, type = dvo.resource_record_type
    }
  }
  zone_id = var.hosted_zone_id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.value]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "cert" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}

# --- CloudFront with OAC ---
resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "${var.domain}-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  aliases             = [var.domain, "www.${var.domain}"]
  http_version        = "http2and3"
  # PriceClass_All serves all CloudFront edge locations including India,
  # Australia, South Africa. Cost difference at low traffic is pennies/month;
  # latency benefit for non-US/EU users is significant.
  price_class         = "PriceClass_All"

  origin {
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_id                = "s3-origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
  }

  default_cache_behavior {
    target_origin_id       = "s3-origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    # AWS-managed CachingOptimized policy
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }

  # HTML files: shorter TTL so deploys go live fast.
  ordered_cache_behavior {
    path_pattern           = "*.html"
    target_origin_id       = "s3-origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    # AWS-managed CachingDisabled
    cache_policy_id        = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
  }

  custom_error_response {
    error_code         = 403
    response_code      = 404
    response_page_path = "/404.html"
  }
  custom_error_response {
    error_code         = 404
    response_code      = 404
    response_page_path = "/404.html"
  }

  restrictions { geo_restriction { restriction_type = "none" } }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.cert.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

# --- Bucket policy that grants OAC the GET permission ---
data "aws_iam_policy_document" "bucket" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.site.arn}/*"]
    principals { type = "Service" identifiers = ["cloudfront.amazonaws.com"] }
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.site.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id
  policy = data.aws_iam_policy_document.bucket.json
}

# --- DNS A-records (apex + www) ---
resource "aws_route53_record" "apex" {
  zone_id = var.hosted_zone_id
  name    = var.domain
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www" {
  zone_id = var.hosted_zone_id
  name    = "www.${var.domain}"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}

output "cloudfront_domain" { value = aws_cloudfront_distribution.site.domain_name }
output "distribution_id"   { value = aws_cloudfront_distribution.site.id }
output "bucket_name"       { value = aws_s3_bucket.site.bucket }
