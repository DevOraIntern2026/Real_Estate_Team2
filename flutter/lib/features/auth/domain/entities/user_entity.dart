import 'package:equatable/equatable.dart';

enum UserRole { customer, owner, agent, admin }

class UserEntity extends Equatable {
  final String id;
  final String email;
  final UserRole role;
  final bool isEmailVerified;

  const UserEntity({
    required this.id,
    required this.email,
    required this.role,
    required this.isEmailVerified,
  });

  @override
  List<Object?> get props => [id, email, role, isEmailVerified];
}
