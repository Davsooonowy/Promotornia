from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('dean/', views.DeanView.as_view(), name='dean'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('login/refresh/', TokenRefreshView.as_view(), name='refresh'),
]