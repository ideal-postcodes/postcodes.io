Query for geographical places across countries. Each query will return a list of place suggestions, which consists of a place name, descriptive name and id.

This API returns geographical information such as countries, capitals, administrative areas and more. It is ideal for correctly identifying a place along with any other details like geolocation.

## Implementing Place Autocomplete

Extracting the full information of a place is a 2 step process:

1. Retrieve place suggestions via /places
2. Retrieve the entire place with the ID provided in the suggestion

## Suggestion Format

Each place suggestion contains a descriptive name which you can provide to users to uniquely idenfity a place.

## Rate Limiting

You can make up to 3000 requests to the autocomplete API within a 5 minute span. The HTTP Header contains information on your current rate limit.

| Header                  | Description                                                                            |
| ----------------------- | -------------------------------------------------------------------------------------- |
| `X-RateLimit-Limit`     | The maximum number of requests that can be made in 5 minutes                           |
| `X-RateLimit-Remaining` | The remaining requests within the current rate limit window                            |
| `X-RateLimit-Reset`     | The time when the rate limit window resets in Unix Time (seconds) or UTC Epoch seconds |

## Pricing

This API currently does not affect your balance. However, resolving a suggestion into a full place requires a paid request.

Please note, this API is not intended as a standalone free resource. Integrations that consistently make autocomplete requests without a paid request to resolve an place may be disrupted via tightened rate limits.
