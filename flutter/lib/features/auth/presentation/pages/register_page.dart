import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/custom_auth_field.dart';
import '../../../../core/widgets/google_logo.dart';
import '../../domain/entities/user_entity.dart';
import '../cubit/auth_cubit.dart';
import '../cubit/auth_state.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _obscurePassword = true;
  bool _agreedToTerms = true;
  UserRole _selectedRole = UserRole.customer;

  static const _selectableRoles = [
    UserRole.customer,
    UserRole.owner,
    UserRole.agent
  ];

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  String _roleLabel(UserRole role) {
    switch (role) {
      case UserRole.customer:
        return 'Customer';
      case UserRole.owner:
        return 'Owner';
      case UserRole.agent:
        return 'Agent';
      case UserRole.admin:
        return 'Admin';
    }
  }

  void _submit() {
    if (_nameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('Enter your full name')));
      return;
    }
    if (!_emailController.text.contains('@')) {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('Enter a valid email')));
      return;
    }
    if (_passwordController.text.length < 6) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Password must be at least 6 characters')));
      return;
    }
    if (!_agreedToTerms) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please agree with terms and privacy')));
      return;
    }

    context.read<AuthCubit>().register(
          name: _nameController.text.trim(),
          email: _emailController.text.trim(),
          password: _passwordController.text,
          role: _selectedRole,
        );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: BlocConsumer<AuthCubit, AuthState>(
          listener: (context, state) {
            if (state is AuthAuthenticated) {
              context.go('/home');
            } else if (state is AuthError) {
              ScaffoldMessenger.of(context)
                  .showSnackBar(SnackBar(content: Text(state.message)));
            }
          },
          builder: (context, state) {
            return SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      IconButton(
                        onPressed: () => context.canPop()
                            ? context.pop()
                            : context.go('/login'),
                        icon: const Icon(Icons.arrow_back),
                      ),
                      TextButton(
                        onPressed: () => context.go('/home'),
                        child: const Text('Skip',
                            style: TextStyle(color: AppColors.textSecondary)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Register Account',
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Sign up with your email and password\nor social media to continue',
                    style:
                        TextStyle(color: AppColors.textSecondary, height: 1.4),
                  ),
                  const SizedBox(height: 24),
                  CustomAuthField(
                    label: 'Full Name',
                    hint: 'Full Name',
                    controller: _nameController,
                  ),
                  const SizedBox(height: 16),
                  CustomAuthField(
                    label: 'Email',
                    hint: 'Enter your Email',
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                  ),
                  const SizedBox(height: 16),
                  CustomAuthField(
                    label: 'Password',
                    hint: 'Enter your Password',
                    controller: _passwordController,
                    isObscured: _obscurePassword,
                    showObscureToggle: true,
                    onToggleObscure: () =>
                        setState(() => _obscurePassword = !_obscurePassword),
                  ),
                  const SizedBox(height: 16),
                  const Text("What's your role?",
                      style:
                          TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<UserRole>(
                    initialValue: _selectedRole,
                    icon: const Icon(Icons.keyboard_arrow_down,
                        color: AppColors.textSecondary),
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: Colors.white,
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 14),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(28),
                        borderSide: const BorderSide(color: AppColors.border),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(28),
                        borderSide: const BorderSide(color: AppColors.border),
                      ),
                    ),
                    items: _selectableRoles
                        .map((role) => DropdownMenuItem(
                            value: role, child: Text(_roleLabel(role))))
                        .toList(),
                    onChanged: (role) {
                      if (role != null) setState(() => _selectedRole = role);
                    },
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      SizedBox(
                        width: 22,
                        height: 22,
                        child: Checkbox(
                          value: _agreedToTerms,
                          onChanged: (v) =>
                              setState(() => _agreedToTerms = v ?? false),
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Text('Agree with terms and privacy',
                          style: TextStyle(fontSize: 13)),
                    ],
                  ),
                  const SizedBox(height: 20),
                  state is AuthLoading
                      ? const Center(child: CircularProgressIndicator())
                      : SizedBox(
                          height: 40.h,
                          child: ElevatedButton(
                            style: ButtonStyle(
                                shape: WidgetStateProperty.all(
                                    RoundedRectangleBorder(
                                        borderRadius:
                                            BorderRadius.circular(30.sp)))),
                            onPressed: _submit,
                            child: const Text('Sign up',
                                style: TextStyle(fontSize: 16)),
                          ),
                        ),
                  const SizedBox(height: 16),
                  const Center(
                    child: Text('Or',
                        style: TextStyle(color: AppColors.textSecondary)),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    height: 40.h,
                    child: OutlinedButton.icon(
                      onPressed: () {},
                      icon: const GoogleLogo(),
                      label: const Text('Google'),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Center(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text('Already have an account ? ',
                            style: TextStyle(color: AppColors.textSecondary)),
                        GestureDetector(
                          onTap: () => context.go('/login'),
                          child: const Text('Login',
                              style: TextStyle(
                                  color: AppColors.accent,
                                  fontWeight: FontWeight.w600)),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
