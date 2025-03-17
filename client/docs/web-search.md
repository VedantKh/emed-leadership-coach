Log in [Sign up](https://platform.openai.com/signup)

# Web search

Allow models to search the web for the latest information before generating a response.

Copy page

Using the [Chat Completions API](https://platform.openai.com/docs/api-reference/chat), you can directly access the fine-tuned models and tool used by [Search in ChatGPT](https://openai.com/index/introducing-chatgpt-search/).

When using Chat Completions, the model always retrieves information from the web before responding to your query. To use `web_search_preview` as a tool that models like `gpt-4o` and `gpt-4o-mini` invoke only when necessary, switch to using the [Responses API](https://platform.openai.com/docs/guides/tools-web-search?api-mode=responses).

Currently, you need to use one of these models to use web search in Chat Completions:

- `gpt-4o-search-preview`
- `gpt-4o-mini-search-preview`

Web search parameter example

javascript

```javascript
1
2
3
4
5
6
7
8
9
10
11
12
13
import OpenAI from "openai";
const client = new OpenAI();

const completion = await client.chat.completions.create({
    model: "gpt-4o-search-preview",
    web_search_options: {},
    messages: [{\
        "role": "user",\
        "content": "What was a positive news story from today?"\
    }],
});

console.log(completion.choices[0].message.content);
```

```python
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
from openai import OpenAI
client = OpenAI()

completion = client.chat.completions.create(
    model="gpt-4o-search-preview",
    web_search_options={},
    messages=[\
        {\
            "role": "user",\
            "content": "What was a positive news story from today?",\
        }\
    ],
)

print(completion.choices[0].message.content)
```

```bash
1
2
3
4
5
6
7
8
9
10
11
curl -X POST "https://api.openai.com/v1/chat/completions" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-type: application/json" \
    -d '{
        "model": "gpt-4o-search-preview",
        "web_search_options": {},
        "messages": [{\
            "role": "user",\
            "content": "What was a positive news story from today?"\
        }]
    }'
```

## Output and citations

The API response item in the `choices` array will include:

- `message.content` with the text result from the model, inclusive of any inline citations
- `annotations` with a list of cited URLs

By default, the model's response will include inline citations for URLs found in the web search results. In addition to this, the `url_citation` annotation object will contain the URL and title of the cited source, as well as the start and end index characters in the model's response where those sources were used.

When displaying web results or information contained in web results to end users, inline citations must be made clearly visible and clickable in your user interface.

```json
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
[\
  {\
    "index": 0,\
    "message": {\
      "role": "assistant",\
      "content": "the model response is here...",\
      "refusal": null,\
      "annotations": [\
        {\
          "type": "url_citation",\
          "url_citation": {\
            "end_index": 985,\
            "start_index": 764,\
            "title": "Page title...",\
            "url": "https://..."\
          }\
        }\
      ]\
    },\
    "finish_reason": "stop"\
  }\
]
```

## User location

To refine search results based on geography, you can specify an approximate user location using country, city, region, and/or timezone.

- The `city` and `region` fields are free text strings, like `Minneapolis` and `Minnesota` respectively.
- The `country` field is a two-letter [ISO country code](https://en.wikipedia.org/wiki/ISO_3166-1), like `US`.
- The `timezone` field is an [IANA timezone](https://timeapi.io/documentation/iana-timezones) like `America/Chicago`.

Customizing user location

javascript

```python
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
from openai import OpenAI
client = OpenAI()

completion = client.chat.completions.create(
    model="gpt-4o-search-preview",
    web_search_options={
        "user_location": {
            "type": "approximate",
            "approximate": {
                "country": "GB",
                "city": "London",
                "region": "London",
            }
        },
    },
    messages=[{\
        "role": "user",\
        "content": "What are the best restaurants around Granary Square?",\
    }],
)

print(completion.choices[0].message.content)
```

```javascript
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
import OpenAI from "openai";
const client = new OpenAI();

const completion = await client.chat.completions.create({
    model: "gpt-4o-search-preview",
    web_search_options: {
        user_location: {
            type: "approximate",
            approximate: {
                country: "GB",
                city: "London",
                region: "London",
            },
        },
    },
    messages: [{\
        "role": "user",\
        "content": "What are the best restaurants around Granary Square?",\
    }],
});
console.log(completion.choices[0].message.content);
```

```bash
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
curl -X POST "https://api.openai.com/v1/chat/completions" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-type: application/json" \
    -d '{
        "model": "gpt-4o-search-preview",
        "web_search_options": {
            "user_location": {
                "type": "approximate",
                "approximate": {
                    "country": "GB",
                    "city": "London",
                    "region": "London",
                }
            }
        },
        "messages": [{\
            "role": "user",\
            "content": "What are the best restaurants around Granary Square?"\
        }]
    }'
```

## Search context size

When using this tool, the `search_context_size` parameter controls how much context is retrieved from the web to help the tool formulate a response. The tokens used by the search tool do **not** affect the context window of the main model specified in the `model` parameter in your response creation request. These tokens are also **not** carried over from one turn to another — they're simply used to formulate the tool response and then discarded.

Choosing a context size impacts:

- **Cost**: Pricing of our search tool varies based on the value of this parameter. Higher context sizes are more expensive. See tool pricing [here](https://platform.openai.com/docs/pricing).
- **Quality**: Higher search context sizes generally provide richer context, resulting in more accurate, comprehensive answers.
- **Latency**: Higher context sizes require processing more tokens, which can slow down the tool's response time.

Available values:

- **`high`**: Most comprehensive context, highest cost, slower response.
- **`medium`** (default): Balanced context, cost, and latency.
- **`low`**: Least context, lowest cost, fastest response, but potentially lower answer quality.

Again, tokens used by the search tool do **not** impact main model's token usage and are not carried over from turn to turn. Check the [pricing page](https://platform.openai.com/docs/pricing) for details on costs associated with each context size.

Customizing search context size

javascript

```python
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
from openai import OpenAI
client = OpenAI()

completion = client.chat.completions.create(
    model="gpt-4o-search-preview",
    web_search_options={
        "search_context_size": "low",
    },
    messages=[{\
        "role": "user",\
        "content": "What movie won best picture in 2025?",\
    }],
)

print(completion.choices[0].message.content)
```

```javascript
1
2
3
4
5
6
7
8
9
10
11
12
13
14
import OpenAI from "openai";
const client = new OpenAI();

const completion = await client.chat.completions.create({
    model: "gpt-4o-search-preview",
    web_search_options: {
        search_context_size: "low",
    },
    messages: [{\
        "role": "user",\
        "content": "What movie won best picture in 2025?",\
    }],
});
console.log(completion.choices[0].message.content);
```

```bash
1
2
3
4
5
6
7
8
9
10
11
12
13
curl -X POST "https://api.openai.com/v1/chat/completions" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-type: application/json" \
    -d '{
        "model": "gpt-4o-search-preview",
        "web_search_options": {
            "search_context_size": "low"
        },
        "messages": [{\
            "role": "user",\
            "content": "What movie won best picture in 2025?"\
        }]
    }'
```

## Limitations

Below are a few notable implementation considerations when using web search.

- This tool does not support zero data retention or data residency ( [data retention policies](https://platform.openai.com/docs/guides/your-data)).
- The [`gpt-4o-search-preview`](https://platform.openai.com/docs/models/gpt-4o-search-preview) and [`gpt-4o-mini-search-preview`](https://platform.openai.com/docs/models/gpt-4o-mini-search-preview) models used in Chat Completions only support a subset of API parameters - view their model data pages for specific information on rate limits and feature support.
- When used as a tool in the [Responses API](https://platform.openai.com/docs/api-reference/responses), web search has the same tiered rate limits as the models above.

Chat Completions

NEW

Discover the Responses API, our new API built for agents and tools.

NEW

Discover the Responses API, our new API built for agents and tools.

Log in [Sign up](https://platform.openai.com/signup)

# Web search

Allow models to search the web for the latest information before generating a response.

Copy page

Using the [Responses API](https://platform.openai.com/docs/api-reference/responses), you can enable web search by configuring it in the `tools` array in an API request to generate content. Like any other tool, the model can choose to search the web or not based on the content of the input prompt.

Web search tool example

javascript

```javascript
1
2
3
4
5
6
7
8
9
10
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-4o",
    tools: [ { type: "web_search_preview" } ],
    input: "What was a positive news story from today?",
});

console.log(response.output_text);
```

```python
1
2
3
4
5
6
7
8
9
10
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-4o",
    tools=[{"type": "web_search_preview"}],
    input="What was a positive news story from today?"
)

print(response.output_text)
```

```bash
1
2
3
4
5
6
7
8
curl "https://api.openai.com/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-4o",
        "tools": [{"type": "web_search_preview"}],
        "input": "what was a positive news story from today?"
    }'
```

Web search tool versions

The current default version of the web search tool is:

`web_search_preview`

Which points to a dated version:

`web_search_preview_2025_03_11`

As the tool evolves, future dated snapshot versions will be documented in
the [API reference](https://platform.openai.com/docs/api-reference/responses/create).

You can also force the use of the `web_search_preview` tool by using the `tool_choice` parameter, and setting it to `{type: "web_search_preview"}` \- this can help ensure lower latency and more consistent results.

## Output and citations

Model responses that use the web search tool will include two parts:

- A `web_search_call` output item with the ID of the search call.
- A `message` output item containing:

  - The text result in `message.content[0].text`
  - Annotations `message.content[0].annotations` for the cited URLs

By default, the model's response will include inline citations for URLs found in the web search results. In addition to this, the `url_citation` annotation object will contain the URL, title and location of the cited source.

When displaying web results or information contained in web results to end users, inline citations must be made clearly visible and clickable in your user interface.

```json
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
[\
  {\
    "type": "web_search_call",\
    "id": "ws_67c9fa0502748190b7dd390736892e100be649c1a5ff9609",\
    "status": "completed"\
  },\
  {\
    "id": "msg_67c9fa077e288190af08fdffda2e34f20be649c1a5ff9609",\
    "type": "message",\
    "status": "completed",\
    "role": "assistant",\
    "content": [\
      {\
        "type": "output_text",\
        "text": "On March 6, 2025, several news...",\
        "annotations": [\
          {\
            "type": "url_citation",\
            "start_index": 2606,\
            "end_index": 2758,\
            "url": "https://...",\
            "title": "Title..."\
          }\
        ]\
      }\
    ]\
  }\
]
```

## User location

To refine search results based on geography, you can specify an approximate user location using country, city, region, and/or timezone.

- The `city` and `region` fields are free text strings, like `Minneapolis` and `Minnesota` respectively.
- The `country` field is a two-letter [ISO country code](https://en.wikipedia.org/wiki/ISO_3166-1), like `US`.
- The `timezone` field is an [IANA timezone](https://timeapi.io/documentation/iana-timezones) like `America/Chicago`.

Customizing user location

javascript

```python
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-4o",
    tools=[{\
        "type": "web_search_preview",\
        "user_location": {\
            "type": "approximate",\
            "country": "GB",\
            "city": "London",\
            "region": "London",\
        }\
    }],
    input="What are the best restaurants around Granary Square?",
)

print(response.output_text)
```

```javascript
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-4o",
    tools: [{\
        type: "web_search_preview",\
        user_location: {\
            type: "approximate",\
            country: "GB",\
            city: "London",\
            region: "London"\
        }\
    }],
    input: "What are the best restaurants around Granary Square?",
});
console.log(response.output_text);
```

```bash
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
curl "https://api.openai.com/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-4o",
        "tools": [{\
            "type": "web_search_preview",\
            "user_location": {\
                "type": "approximate",\
                "country": "GB",\
                "city": "London",\
                "region": "London"\
            }\
        }],
        "input": "What are the best restaurants around Granary Square?"
    }'
```

## Search context size

When using this tool, the `search_context_size` parameter controls how much context is retrieved from the web to help the tool formulate a response. The tokens used by the search tool do **not** affect the context window of the main model specified in the `model` parameter in your response creation request. These tokens are also **not** carried over from one turn to another — they're simply used to formulate the tool response and then discarded.

Choosing a context size impacts:

- **Cost**: Pricing of our search tool varies based on the value of this parameter. Higher context sizes are more expensive. See tool pricing [here](https://platform.openai.com/docs/pricing).
- **Quality**: Higher search context sizes generally provide richer context, resulting in more accurate, comprehensive answers.
- **Latency**: Higher context sizes require processing more tokens, which can slow down the tool's response time.

Available values:

- **`high`**: Most comprehensive context, highest cost, slower response.
- **`medium`** (default): Balanced context, cost, and latency.
- **`low`**: Least context, lowest cost, fastest response, but potentially lower answer quality.

Again, tokens used by the search tool do **not** impact main model's token usage and are not carried over from turn to turn. Check the [pricing page](https://platform.openai.com/docs/pricing) for details on costs associated with each context size.

Customizing search context size

javascript

```python
1
2
3
4
5
6
7
8
9
10
11
12
13
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-4o",
    tools=[{\
        "type": "web_search_preview",\
        "search_context_size": "low",\
    }],
    input="What movie won best picture in 2025?",
)

print(response.output_text)
```

```javascript
1
2
3
4
5
6
7
8
9
10
11
12
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-4o",
    tools: [{\
        type: "web_search_preview",\
        search_context_size: "low",\
    }],
    input: "What movie won best picture in 2025?",
});
console.log(response.output_text);
```

```bash
1
2
3
4
5
6
7
8
9
10
11
curl "https://api.openai.com/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-4o",
        "tools": [{\
            "type": "web_search_preview",\
            "search_context_size": "low"\
        }],
        "input": "What movie won best picture in 2025?"
    }'
```

## Limitations

Below are a few notable implementation considerations when using web search.

- This tool does not support zero data retention or data residency ( [data retention policies](https://platform.openai.com/docs/guides/your-data)).
- The [`gpt-4o-search-preview`](https://platform.openai.com/docs/models/gpt-4o-search-preview) and [`gpt-4o-mini-search-preview`](https://platform.openai.com/docs/models/gpt-4o-mini-search-preview) models used in Chat Completions only support a subset of API parameters - view their model data pages for specific information on rate limits and feature support.
- When used as a tool in the [Responses API](https://platform.openai.com/docs/api-reference/responses), web search has the same tiered rate limits as the models above.

Responses

NEW

Discover the Responses API, our new API built for agents and tools.

NEW

Discover the Responses API, our new API built for agents and tools.