"""create posts table and updated_at trigger"""

from alembic import op
import sqlalchemy as sa

revision = "0001_create_posts"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "posts",
        sa.Column("id", sa.Integer(), sa.Identity(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    # ORM이 아니라 PostgreSQL이 수정 시각을 관리하도록 trigger를 둔다.
    op.execute("""
        CREATE OR REPLACE FUNCTION set_posts_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)
    op.execute("""
        CREATE TRIGGER posts_set_updated_at
        BEFORE UPDATE ON posts
        FOR EACH ROW
        EXECUTE FUNCTION set_posts_updated_at();
    """)


def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS posts_set_updated_at ON posts")
    op.execute("DROP FUNCTION IF EXISTS set_posts_updated_at()")
    op.drop_table("posts")
