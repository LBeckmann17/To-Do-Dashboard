"""Add new shopping categories and price_memory table

Revision ID: a1b2c3d4e5f6
Revises:
Create Date: 2026-06-17

Changes:
- Converts shopping_items.category from native Postgres enum to VARCHAR(50)
  so new categories can be added without ALTER TYPE migrations in the future.
- Creates price_memory table for persistent per-item price recall.
"""
import sqlalchemy as sa
from alembic import op

revision = "a1b2c3d4e5f6"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Convert native Postgres enum column to plain VARCHAR, preserving existing values
    op.execute(sa.text(
        "ALTER TABLE shopping_items "
        "ALTER COLUMN category TYPE VARCHAR(50) USING category::text"
    ))
    op.execute(sa.text("DROP TYPE IF EXISTS shopping_category"))

    # Price memory: remembers the last manually set price per item name
    op.create_table(
        "price_memory",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name_normalized", sa.String(500), nullable=False),
        sa.Column("price", sa.Float(), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name_normalized", name="uq_price_memory_name"),
    )
    op.create_index("ix_price_memory_name_normalized", "price_memory", ["name_normalized"])


def downgrade() -> None:
    op.drop_index("ix_price_memory_name_normalized", table_name="price_memory")
    op.drop_table("price_memory")
    # Note: reverting VARCHAR → native enum is intentionally not implemented
