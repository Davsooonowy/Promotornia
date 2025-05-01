
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from . import models
import os
import datetime
import random

ALLOWED_DOMAINS = os.getenv('ALLOWED_DOMAINS').split(",")
USER_TYPES = os.getenv('USER_TYPES').split(",")
PASSWORD_LENGTH = 50

def validate_email(email):
    try:
        domain = email.split('@')[1]
    except IndexError:
        raise serializers.ValidationError('Niepoprawny format adresu ' + email)
    if domain not in ALLOWED_DOMAINS:
        raise serializers.ValidationError(f'Niedozwolona domena {domain}. Jedyne dozwolone to {", ".join(ALLOWED_DOMAINS)}')

class RegisterSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.SystemUser
        fields = ('email', 'first_name', 'last_name', 'password',
                  'is_student', 'is_supervisor', 'is_dean')

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        if email is None:
            raise serializers.ValidationError('Wymagane jest podanie adresu email')
        if password is None:
            raise serializers.ValidationError('Wymagane jest podanie hasła')

        validate_email(email)

        is_student = data.get('is_student')
        is_supervisor = data.get('is_supervisor')
        is_dean = data.get('is_dean')

        if [is_student, is_supervisor, is_dean].count(True) != 1:
            raise serializers.ValidationError('Dokładnie jedno pole (student, promotor, dziekan) musi być wskazane!')

        return data

    def create(self, validated_data):
        user = models.SystemUser.objects.create_user(**validated_data)
        return user

class DeanCreateUsersSerializer(serializers.Serializer):

    userType = serializers.ChoiceField(USER_TYPES)
    newUsers = serializers.ListField()
    fieldOfStudy = serializers.DictField()
    expirationDate = serializers.DateField()

    def validate(self, data):
        user_type = data.get('userType')
        print(user_type, USER_TYPES, user_type in USER_TYPES, data)

        new_users = data.get("newUsers", [])
        for user_data in new_users:
            if not isinstance(user_data, dict):
                raise serializers.ValidationError('Niepoprawny format danych użytkownika!')
            validate_email(user_data.get('email', ''))

        existing_users = models.SystemUser.objects.filter(email__in=map(lambda u: u.get('email'), new_users))
        if existing_users.count() > 0:
            invalid_emails = map(lambda u: u.email, existing_users)
            raise serializers.ValidationError(f"Adresy {', '.join(invalid_emails)} są już zajęte")

        field_of_study = data.get('fieldOfStudy', {})
        field_id = field_of_study.get('id')
        field_name = field_of_study.get('field')

        if models.FieldOfStudy.objects.filter(id=field_id, name=field_name).count() == 0:
            raise serializers.ValidationError(f"Kierunek {field_name} nie istnieje w bazie danych!")

        exp_date = data.get('expirationDate')
        if datetime.date.today() > exp_date:
            raise serializers.ValidationError(f"Należy podać datę ważności późniejszą niż dzień dzisiejszy")

        return data

    def create(self, validated_data):
        users = []
        for user_data in validated_data["newUsers"]:
            user_type = "is_" + validated_data["userType"]
            user_dict = {
                "email": user_data["email"],
                "password": make_password(str([chr(random.randint(33, 127)) for _ in range(PASSWORD_LENGTH)])),
                user_type: True
            }
            users.append(models.SystemUser(**user_dict))
        add_result = models.SystemUser.objects.bulk_create(users)
        return add_result

class DeanDeleteUsersSerializer(serializers.Serializer):
    usersToDelete = serializers.ListField()

    def validate(self, data):
        for user_email in data.get('usersToDelete', []):
            validate_email(user_email)
        users = models.SystemUser.objects.filter(email__in=data.get('usersToDelete', []))
        if users.filter(is_dean=True).count() > 0:
            raise serializers.ValidationError("Brak uprawnień usuwania pracowników dziekanatu!")
        return users
