CREATE TABLE "contact_info" (
	"id" text PRIMARY KEY DEFAULT 'default' NOT NULL,
	"street" text DEFAULT '' NOT NULL,
	"city" text DEFAULT '' NOT NULL,
	"state" text DEFAULT '' NOT NULL,
	"postal_code" text DEFAULT '' NOT NULL,
	"country" text DEFAULT 'India' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"instagram" text DEFAULT '' NOT NULL,
	"youtube" text DEFAULT '' NOT NULL,
	"linkedin" text DEFAULT '' NOT NULL,
	"facebook" text DEFAULT '' NOT NULL,
	"modified_by" text DEFAULT 'System' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
