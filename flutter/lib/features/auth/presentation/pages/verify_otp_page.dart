import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:real_estate_app/features/auth/presentation/cubit/auth_cubit.dart';
import 'package:real_estate_app/features/auth/presentation/cubit/auth_state.dart';
import 'package:real_estate_app/features/auth/presentation/pages/otp_input.dart';

import '../../../../core/theme/app_colors.dart';

class VerifyOtpPage extends StatefulWidget {
  final String email;
  const VerifyOtpPage({super.key, required this.email});

  @override
  State<VerifyOtpPage> createState() => _VerifyOtpPageState();
}

class _VerifyOtpPageState extends State<VerifyOtpPage> {
  String _code = '';
  int _resendSeconds = 30;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startResendTimer();
  }

  void _startResendTimer() {
    _resendSeconds = 30;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_resendSeconds == 0) {
        timer.cancel();
      } else {
        setState(() => _resendSeconds--);
      }
    });
  }

  void _resendCode() {
    if (_resendSeconds > 0) return;
    _startResendTimer();
    context.read<AuthCubit>().forgotPassword(email: widget.email);
  }

  void _verify() {
    if (_code.length < 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter the 6-digit code')),
      );
      return;
    }
    context.go('/reset-password', extra: {
      'email': widget.email,
      'otp': _code,
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthCubit, AuthState>(
      listener: (context, state) {
        if (state is AuthForgotPasswordOtpSent) {
          ScaffoldMessenger.of(context)
              .showSnackBar(SnackBar(content: Text(state.message)));
        } else if (state is AuthError) {
          ScaffoldMessenger.of(context)
              .showSnackBar(SnackBar(content: Text(state.message)));
        }
      },
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: SafeArea(
          child: Padding(
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
                const Text('Verify your Email',
                    style:
                        TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text(
                  'Please enter the 6 digit verification code\nthat has been sent to ${widget.email}',
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
                        onPressed: _resendSeconds == 0 ? _resendCode : null,
                        child: Text(
                          _resendSeconds == 0
                              ? 'Resend code'
                              : 'Resend code in ${_resendSeconds}s',
                          style: const TextStyle(
                              color: AppColors.error,
                              fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                ),
                const Spacer(),
                SizedBox(
                  height: 40.h,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(30),
                      ),
                    ),
                    onPressed: _verify,
                    child: const Text('Verify', style: TextStyle(fontSize: 16)),
                  ),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
