# Swagger Documentation for CopperX Payout Bot

This project uses Swagger for API documentation. Swagger provides a user-friendly interface to explore and test the API endpoints.

## Accessing Swagger UI

When the application is running, you can access the Swagger UI at:

```
http://localhost:3000/api
```

## Automatic Swagger Generation

This project includes a script to automatically generate Swagger decorators for your DTOs and controllers. To use it:

1. Install the required dependencies:

```bash
yarn add -D typescript
```

2. Run the Swagger generation script:

```bash
yarn swagger:generate
```

This will scan your codebase and add Swagger decorators to your DTOs and controllers.

## Manual Swagger Decorators

### For DTOs

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class MyDto {
  @ApiProperty({
    description: 'Description of the property',
    example: 'Example value',
    required: true,
    type: String,
  })
  myProperty: string;
}
```

### For Controllers

```typescript
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('my-tag')
@Controller('my-controller')
export class MyController {
  @ApiOperation({ summary: 'Description of the endpoint' })
  @ApiResponse({ status: 200, description: 'Success response' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Get()
  myEndpoint() {
    // Implementation
  }
}
```

## Authentication in Swagger

To test endpoints that require authentication:

1. Obtain a token by calling the authentication endpoint
2. Click the "Authorize" button at the top of the Swagger UI
3. Enter your token in the format: `Bearer your-token-here`
4. Click "Authorize" and close the dialog
5. Now you can test authenticated endpoints

## Best Practices

1. Always add descriptive summaries to your API operations
2. Include examples in your DTO properties
3. Document all possible response statuses
4. Use appropriate tags to organize your endpoints
5. Keep your Swagger documentation up to date with your code

## References

- [NestJS Swagger Documentation](https://docs.nestjs.com/openapi/introduction)
- [Swagger OpenAPI Specification](https://swagger.io/specification/)
