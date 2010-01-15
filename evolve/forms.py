# -*- coding: utf-8 -*-
from django import forms
from django.contrib.auth.models import User
from django.core.files.uploadedfile import UploadedFile
from django.core.mail import send_mail
from django.utils.translation import ugettext_lazy as _, ugettext as __
from django.conf import settings

from ragendja.auth.models import UserTraits
from registration.models import RegistrationProfile

class UserRegistrationForm(forms.ModelForm):
    email = forms.EmailField(widget=forms.TextInput(attrs=dict(maxlength=75)),
         label=_(u'Email address'))
    password1 = forms.CharField(widget=forms.PasswordInput(render_value=False),
        label=_(u'Password'))
    password2 = forms.CharField(widget=forms.PasswordInput(render_value=False),
        label=_(u'Password (again)'))
    receiveNotifications = forms.CharField(widget=forms.CheckboxInput(attrs=dict(checked=True)),
        label=_(u'Do you want to receive application notifications?'))
    receiveAdminEmail = forms.CharField(widget=forms.CheckboxInput(attrs=dict(checked=True)),
        label=_(u'Do you want to receive emails about the application, or feedback?'))
    referralSource = forms.CharField(required=False, widget=forms.Textarea(attrs=dict(rows=4)),
        label=_(u'How did you hear about us?'))

    def clean(self):
        """
        Verify that the values entered into the two password fields
        match. Note that an error here will end up in
        ``non_field_errors()`` because it doesn't apply to a single
        field.
        
        """
        if 'password1' in self.cleaned_data and 'password2' in self.cleaned_data:
            if self.cleaned_data['password1'] != self.cleaned_data['password2']:
                raise forms.ValidationError(__(u'You must type the same password each time'))
        return self.cleaned_data
    
    def save(self, domain_override=""):
        """
        Create the new ``User`` and ``RegistrationProfile``, and
        returns the ``User``.
        
        This is essentially a light wrapper around
        ``RegistrationProfile.objects.create_inactive_user()``,
        feeding it the form data and a profile callback (see the
        documentation on ``create_inactive_user()`` for details) if
        supplied.
        
        """
        new_user = RegistrationProfile.objects.create_inactive_user(
            username=self.cleaned_data['email'],
            password=self.cleaned_data['password1'],
            email=self.cleaned_data['email'],
            domain_override=domain_override)
        self.instance = new_user
        send_mail("[%s] new user has signed up" % settings.APPLICATION_NAME, "%s" % new_user.email, settings.DEFAULT_FROM_EMAIL, [settings.DEFAULT_FROM_EMAIL])
        return super(UserRegistrationForm, self).save()

    def clean_email(self):
        """
        Validate that the supplied email address is unique for the site.
        
        """
        email = self.cleaned_data['email'].lower()
        if User.all().filter('email =', email).filter(
                'is_active =', True).count(1):
            raise forms.ValidationError(__(u'This email address is already in use. Please supply a different email address.'))
        return email

    class Meta:
        model = User
        exclude = UserTraits.properties().keys() + ["showTutorial", "validInvitation","version",  "is_banned", "username","first_name","last_name",] 

