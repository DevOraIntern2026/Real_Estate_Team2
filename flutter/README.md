# Real Estate — Flutter (Team 2)


## Folder structure

```
lib/
  core/                     # shared across all features
    di/                     # get_it service locator
    error/                  # Failure / Exception classes
    network/                # Dio client + NetworkInfo
    router/                 # go_router config
    theme/                  # colors + ThemeData
    usecase/                # base UseCase<Type, Params> contract
  features/
    splash/presentation/    # splash screen (checks auth status)
    auth/
      data/                 # datasources, models, repository impl
      domain/                # entities, repository contract, usecases
      presentation/          # AuthCubit + login/register pages
    home/presentation/       # home placeholder 
    navigation/presentation/ # bottom-nav shell wiring the 4 tabs together
```

