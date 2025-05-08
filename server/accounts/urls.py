from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('dean/users/', views.DeanView.as_view(), name='dean_delete'),
    path('user/login/', views.LoginView.as_view(), name='login'),
    path('user/login/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('all_supervisor_interest_tags/', views.TagListView.as_view(), name='all_supervisor_interest_tags'),
    path('your_tags/', views.MyTagView.as_view(), name='your_tags'),
    path('supervisor/edit_tags/', views.MyTagView.as_view(), name='supervisor_edit_tags'),
    path('supervisor/tags/', views.TagView.as_view(), name='supervisor_tags'),
]