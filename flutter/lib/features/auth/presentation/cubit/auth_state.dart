import 'package:equatable/equatable.dart';

import '../../domain/entities/user_entity.dart';

abstract class AuthState extends Equatable {
  const AuthState();
  @override
  List<Object?> get props => [];
}

class AuthInitial extends AuthState {}

class AuthLoading extends AuthState {}

class AuthAuthenticated extends AuthState {
  final UserEntity user;
  const AuthAuthenticated(this.user);
  @override
  List<Object?> get props => [user];
}

class AuthUnauthenticated extends AuthState {}

class AuthError extends AuthState {
  final String message;
  const AuthError(this.message);
  @override
  List<Object?> get props => [message];
}

class AuthRegistrationPending extends AuthState {
  final String email;
  final String message;
  const AuthRegistrationPending({required this.email, required this.message});
  @override
  List<Object?> get props => [email, message];
}

class AuthEmailConfirmed extends AuthState {
  final String message;
  const AuthEmailConfirmed(this.message);
  @override
  List<Object?> get props => [message];
}

class AuthOtpResent extends AuthState {
  final String message;
  const AuthOtpResent(this.message);
  @override
  List<Object?> get props => [message];
}

class AuthForgotPasswordOtpSent extends AuthState {
  final String email;
  final String message;
  const AuthForgotPasswordOtpSent({required this.email, required this.message});
  @override
  List<Object?> get props => [email, message];
}

class AuthPasswordResetSuccess extends AuthState {
  final String message;
  const AuthPasswordResetSuccess(this.message);
  @override
  List<Object?> get props => [message];
}
