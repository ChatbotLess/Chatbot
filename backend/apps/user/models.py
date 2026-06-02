import uuid

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.validators import (
    MinLengthValidator,
    RegexValidator,
    validate_email,
)

from django.db import models

from user.managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    
    firebase_uid = models.CharField(max_length=128, unique=True)
    
    email = models.EmailField(
        'email',
        unique=True,
        blank=False,
        validators=[validate_email],
    )

    name = models.CharField(
        'nome',
        max_length=150,
        blank=False,
        validators=[
            RegexValidator(
                r'^[a-zA-Z\s]+$',
                'O nome deve conter apenas letras',
            ),
            MinLengthValidator(3, 'O nome deve ter pelo menos 3 caracteres'),
        ],
    )

    is_staff = models.BooleanField(
        'status de staff',
        default=False,
    )

    created_at = models.DateTimeField(
        'criado em',
        auto_now_add=True,
    )
    
    updated_at = models.DateTimeField(
        'atualizado em',
        auto_now=True,
    )

    USERNAME_FIELD = 'email'
    EMAIL_FIELD = 'email'

    REQUIRED_FIELDS = ['name']

    objects = UserManager()

    def __str__(self) -> str:
        return self.email

    @property
    def first_name(self):
        return self.name.split(' ')[0]

    class InertiaMeta:
        fields = (
            'id',
            'email',
            'name',
            'is_staff',
        )
