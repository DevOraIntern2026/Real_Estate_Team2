import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/custom_auth_field.dart';
import '../../../../core/widgets/google_logo.dart';
import '../cubit/auth_cubit.dart';
import '../cubit/auth_state.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _obscurePassword = true;
  bool _rememberMe = true;

  FieldStatus _passwordStatus = FieldStatus.none;
  String? _passwordStatusText;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _onPasswordChanged(String value) {
    setState(() {
      if (value.isEmpty) {
        _passwordStatus = FieldStatus.none;
        _passwordStatusText = null;
      } else if (value.length < 6) {
        _passwordStatus = FieldStatus.none;
        _passwordStatusText = null;
      } else {
        _passwordStatus = FieldStatus.success;
        _passwordStatusText = 'Looks good';
      }
    });
  }

  void _submit() {
    if (_emailController.text.trim().isEmpty ||
        !_emailController.text.contains('@')) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter a valid email')),
      );
      return;
    }
    context.read<AuthCubit>().login(
          email: _emailController.text.trim(),
          password: _passwordController.text,
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
              setState(() {
                _passwordStatus = FieldStatus.error;
                _passwordStatusText = state.message;
              });
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
                        onPressed: () =>
                            context.canPop() ? context.pop() : null,
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
                    'Welcome Back !',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Sign in with your email and password\nor social media to continue',
                    style:
                        TextStyle(color: AppColors.textSecondary, height: 1.4),
                  ),
                  const SizedBox(height: 28),
                  CustomAuthField(
                    label: 'Email',
                    hint: 'Enter your Email',
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                  ),
                  const SizedBox(height: 18),
                  CustomAuthField(
                    label: 'Password',
                    hint: 'Enter your Password',
                    controller: _passwordController,
                    isObscured: _obscurePassword,
                    showObscureToggle: true,
                    onToggleObscure: () =>
                        setState(() => _obscurePassword = !_obscurePassword),
                    status: _passwordStatus,
                    statusText: _passwordStatusText,
                    onChanged: _onPasswordChanged,
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          SizedBox(
                            width: 22,
                            height: 22,
                            child: Checkbox(
                              value: _rememberMe,
                              onChanged: (v) =>
                                  setState(() => _rememberMe = v ?? true),
                            ),
                          ),
                          const SizedBox(width: 8),
                          const Text('Remember me',
                              style: TextStyle(fontSize: 13)),
                        ],
                      ),
                      TextButton(
                        onPressed: () => context.go('/forgot-password'),
                        child: const Text('Forgot password?',
                            style: TextStyle(color: AppColors.accent)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  state is AuthLoading
                      ? const Center(child: CircularProgressIndicator())
                      : SizedBox(
                          height: 40.h,
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(30),
                              ),
                            ),
                            onPressed: _submit,
                            child: const Text('Login',
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
                        const Text("Don't have account ? ",
                            style: TextStyle(color: AppColors.textSecondary)),
                        GestureDetector(
                          onTap: () => context.go('/register'),
                          child: const Text('Sign up',
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
