"""
Alembic script template
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "${rev}"
down_revision = ${down_rev}
branch_labels = ${branch_labels}
depends_on = ${depends_on}


def upgrade() -> None:
    # Create all tables from models
    pass


def downgrade() -> None:
    pass
