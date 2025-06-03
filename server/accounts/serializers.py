
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.db import transaction
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from . import models
import os
import datetime
import secrets
import string

ALLOWED_DOMAINS = os.getenv('ALLOWED_DOMAINS').split(",")
USER_TYPES = os.getenv('USER_TYPES').split(",")
PASSWORD_LENGTH = int(os.getenv('PASSWORD_LENGTH'))

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
        if user_type not in USER_TYPES:
            raise serializers.ValidationError(f'{user_type} nie jest prawidłowym typem użytkownika')

        new_users = data.get("newUsers", [])
        for user_data in new_users:
            if not isinstance(user_data, dict):
                raise serializers.ValidationError('Niepoprawny format danych użytkownika!')
            validate_email(user_data.get('email', ''))
            user_data["password"] = make_password(''.join(secrets.choice(string.ascii_letters + string.digits + string.punctuation) for _ in range(PASSWORD_LENGTH)))

        existing_users = models.SystemUser.objects.filter(email__in=map(lambda u: u.get('email'), new_users))
        if existing_users.count() > 0:
            invalid_emails = map(lambda u: u.email, existing_users)
            raise serializers.ValidationError(f"Adresy {', '.join(invalid_emails)} są już zajęte")

        field_of_study = data.get('fieldOfStudy', {})
        field_id = field_of_study.get('id')
        field_name = field_of_study.get('field')

        if not models.FieldOfStudy.objects.filter(id=field_id, name=field_name).exists():
            raise serializers.ValidationError(f"Kierunek {field_name} nie istnieje w bazie danych!")

        field_of_study = models.FieldOfStudy.objects.get(id=field_id)
        data['field_of_study'] = field_of_study
        exp_date = data.get('expirationDate')
        if datetime.date.today() > exp_date:
            raise serializers.ValidationError("Należy podać datę ważności późniejszą niż dzień dzisiejszy")

        return data

    def create(self, validated_data):
        users = []
        for user_data in validated_data["newUsers"]:
            user_type = "is_" + validated_data["userType"]
            user_dict = {
                "email": user_data["email"],
                "password": user_data["password"],
                user_type: True
            }
            users.append(models.SystemUser(**user_dict))
        with transaction.atomic():
            add_result = models.SystemUser.objects.bulk_create(users)
            for user in add_result:
                user.field_of_study.add(validated_data["fieldOfStudy"]["id"])
        return add_result

class DeanDeleteUsersSerializer(serializers.Serializer):
    usersToDelete = serializers.ListField(
        child=serializers.EmailField(),
        allow_empty=False
    )

    def validate(self, data):
        emails = data.get('usersToDelete', [])
        for email in emails:
            validate_email(email)

        users = models.SystemUser.objects.filter(email__in=emails)
        if users.filter(is_dean=True).exists():
            raise serializers.ValidationError("Brak uprawnień usuwania pracowników dziekanatu!")

        return users

class LoginSerializer(TokenObtainPairSerializer):
    def get_token(self, user):
        token = super().get_token(user)

        if user.is_dean:
            token['role'] = 'dean'
        elif user.is_supervisor:
            token['role'] = 'supervisor'
        elif user.is_student:
            token['role'] = 'student'
        else:
            token['role'] = 'unknown'

        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        return data

class FieldOfStudySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.FieldOfStudy
        fields = ('id', 'name', 'description')

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.SystemUser
        fields = ('id', 'email', 'first_name', 'last_name', 'title')

class SupervisorSerializer(serializers.ModelSerializer):
    free_spots = serializers.IntegerField(default=0)
    total_spots = serializers.IntegerField(default=0)
    field_of_study = FieldOfStudySerializer(read_only=True, many=True)

    class Meta:
        model = models.SystemUser
        fields = ('id', 'email', 'title', 'first_name', 'last_name', 'field_of_study',
                  'free_spots', 'total_spots')

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

class SetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    password  = serializers.CharField(required=True)

class PersonalDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.SystemUser
        fields = ('first_name', 'last_name', 'email')

class SupervisorViewSerializer(serializers.ModelSerializer):
    free_spots = serializers.SerializerMethodField()
    total_spots = serializers.IntegerField()
    field_of_study = FieldOfStudySerializer(read_only=True, many=True)

    class Meta:
        model = models.SystemUser
        fields = (
            'id', 'email', 'title', 'first_name', 'last_name',
            'field_of_study', 'total_spots', 'free_spots', 'description'
        )

    def get_free_spots(self, obj):
        taken_statuses = ['Zarezerwowany', 'Student zaakceptowany', 'Zatwierdzony']
        taken_spots = obj.owned_theses.filter(status__in=taken_statuses).count()
        return obj.total_spots - taken_spots
    
class DescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.SystemUser
        fields = ('description',)