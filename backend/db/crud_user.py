from sqlalchemy.orm import Session
from . import models, schemas, security

def create_user(db: Session, user: schemas.UserCreate):
    hashed_pw = security.hash_password(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=hashed_pw
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, username: str, password: str):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        return None
    if not security.verify_password(password, user.password_hash):
        return None
    return user
