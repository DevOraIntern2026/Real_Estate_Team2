class ServerException implements Exception {
  final String message;
  ServerException([this.message = 'Server error']);
}

class CacheException implements Exception {
  final String message;
  CacheException([this.message = 'Cache error']);
}
