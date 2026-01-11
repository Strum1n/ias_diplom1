"""Restored migration

Revision ID: b19acdc5ecc5
Revises: 5e63bafbcf06
Create Date: 2026-01-09 18:46:16.813365

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import geoalchemy2
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'b19acdc5ecc5'
down_revision: Union[str, Sequence[str], None] = '5e63bafbcf06'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
