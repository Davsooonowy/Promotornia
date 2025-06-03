from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('dean/users/', views.DeanView.as_view(), name='dean_delete'),
    path('user/login/', views.LoginView.as_view(), name='login'),
    path('user/login/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path("set_password/", views.OneTimePasswordView.as_view(), name="set_password"),
    path('user/new_password/', views.ChangePasswordView.as_view(), name='change_password'),
    path('user/personal_data/', views.PersonalDataView.as_view(), name='personal_data'),
    path('field_of_study/', views.FieldOfStudyView.as_view(), name='field_of_study'),
    path('field_of_study/<int:pk>/', views.FieldOfStudyView.as_view(), name='field_of_study'),
    path('user/fields_of_study/', views.FieldOfStudyListView.as_view(), name='fields_of_study'),
    path('user/supervisor/<int:supervisor_id>/', views.SupervisorDetailView.as_view(), name='supervisor_profile'),
    path('user/description/', views.DescriptionView.as_view(), name='description_view'),
]