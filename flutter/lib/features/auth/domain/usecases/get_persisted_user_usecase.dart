import '../entities/user_entity.dart';
import '../repositories/auth_repository.dart';

class GetPersistedUserUseCase {
  final AuthRepository repository;
  GetPersistedUserUseCase(this.repository);

  Future<UserEntity?> call() => repository.getPersistedUser();
}
