
from rest_framework import serializers
from .models import SystemUser
import os

ALLOWED_DOMAINS = os.getenv('ALLOWED_DOMAINS').split(",")

class RegisterSerializer(serializers.ModelSerializer):

    class Meta:
        model = SystemUser
        fields = ('email', 'first_name', 'last_name', 'password',
                  'is_student', 'is_supervisor', 'is_dean')

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        if email is None:
            raise serializers.ValidationError('Wymagane jest podanie adresu email')
        if password is None:
            raise serializers.ValidationError('Wymagane jest podanie hasła')
        try:
            domain = email.split('@')[1]
        except IndexError:
            raise serializers.ValidationError('Niepoprawny format adresu email')
        if domain not in ALLOWED_DOMAINS:
            raise serializers.ValidationError('Niedozwolona domena. Jedyne dozwolone to ' + ', '.join(ALLOWED_DOMAINS))

        is_student = data.get('is_student')
        is_supervisor = data.get('is_supervisor')
        is_dean = data.get('is_dean')

        if [is_student, is_supervisor, is_dean].count(True) != 1:
            raise serializers.ValidationError('Dokładnie jedno pole (student, promotor, dziekan) musi być wskazane!')

        return data

    def create(self, validated_data):
        user = SystemUser.objects.create_user(**validated_data)
        return user
