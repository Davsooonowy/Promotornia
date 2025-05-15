
from django.urls import path

from . import views

urlpatterns = [
    path('thesis/list/', views.ThesisListView.as_view(), name='thesis-list'),
    path('thesis/', views.ThesisView.as_view(), name='thesis'),
    path('thesis/<int:thesis_id>/', views.ThesisView.as_view(), name='thesis-detail'),
    path('supervisors/list/', views.SupervisorListView.as_view(), name='supervisors-list'),
    path('all_supervisor_interest_tags/', views.TagListView.as_view(), name='all_supervisor_interest_tags'),
    path('your_tags/', views.MyTagView.as_view(), name='your_tags'),
    path('supervisor/edit_tags/', views.MyTagView.as_view(), name='supervisor_edit_tags'),
    path('supervisor/tags/', views.TagView.as_view(), name='supervisor_tags'),
]