import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:real_estate_app/features/auth/presentation/pages/otp_input.dart';

import '../../../../core/theme/app_colors.dart';
import '../cubit/auth_cubit.dart';
import '../cubit/auth_state.dart';

class ConfirmEmailPage extends StatefulWidget {
  final String email;
  const ConfirmEmailPage({super.key, required this.email});

  @override
  State<ConfirmEmailPage> createState() => _ConfirmEmailPageState();
}

class _ConfirmEmailPageState extends State<ConfirmEmailPage> {
  String _code = '';

  void _verify() {
    if (_code.length < 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter the 6-digit code')),
      );
      return;
    }
    context.read<AuthCubit>().confirmEmail(email: widget.email, otp: _code);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: BlocConsumer<AuthCubit, AuthState>(
          listener: (context, state) {
            if (state is AuthEmailConfirmed) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                    content: Text('Email confirmed — please log in')),
              );
              context.go('/login');
            } else if (state is AuthError) {
              ScaffoldMessenger.of(context)
                  .showSnackBar(SnackBar(content: Text(state.message)));
            }
          },
          builder: (context, state) {
            return Padding(
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
                            : context.go('/register'),
                        icon: const Icon(Icons.arrow_back),
                      ),
                      TextButton(
                        onPressed: () => context.go('/login'),
                        child: const Text('Skip',
                            style: TextStyle(color: AppColors.textSecondary)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Text('Verify your Email',
                      style:
                          TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text(
                    'Please enter the 6 digit code that was\nsent to ${widget.email}',
                    style: const TextStyle(
                        color: AppColors.textSecondary, height: 1.4),
                  ),
                  const SizedBox(height: 32),
                  OtpInput(
                    length: 6,
                    onChanged: (code) => setState(() => _code = code),
                    onCompleted: (_) => _verify(),
                  ),
                  const SizedBox(height: 20),
                  Center(
                    child: Column(
                      children: [
                        const Text("Didn't receive code ?",
                            style: TextStyle(
                                color: AppColors.textSecondary, fontSize: 13)),
                        TextButton(
                          // TODO: wire to a real resend endpoint once Backend 1 confirms one
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                  content: Text('Resend not available yet')),
                            );
                          },
                          child: const Text('Resend code',
                              style: TextStyle(
                                  color: AppColors.error,
                                  fontWeight: FontWeight.w600)),
                        ),
                      ],
                    ),
                  ),
                  const Spacer(),
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
                            onPressed: _verify,
                            child: const Text('Verify',
                                style: TextStyle(fontSize: 16)),
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
