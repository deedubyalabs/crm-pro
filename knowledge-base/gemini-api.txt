Gemini models

2.5 Pro 

Our most powerful thinking model with maximum response accuracy and state-of-the-art performance

Input audio, images, video, and text, get text responses
Tackle difficult problems, analyze large databases, and more
Best for complex coding, reasoning, and multimodal understanding
2.0 Flash 

Our newest multimodal model, with next generation features and improved capabilities

Input audio, images, video, and text, get text responses
Generate code and images, extract data, analyze files, generate graphs, and more
Low latency, enhanced performance, built to power agentic experiences
2.0 Flash-Lite

A Gemini 2.0 Flash model optimized for cost efficiency and low latency

Input audio, images, video, and text, get text responses
Outperforms 1.5 Flash on the majority of benchmarks
A 1 million token context window and multimodal input, like Flash 2.0
Model variants
The Gemini API offers different models that are optimized for specific use cases. Here's a brief overview of Gemini variants that are available:

Model variant	Input(s)	Output	Optimized for
Gemini 2.5 Pro Preview
gemini-2.5-pro-preview-03-25	Audio, images, videos, and text	Text	Enhanced thinking and reasoning, multimodal understanding, advanced coding, and more
Gemini 2.0 Flash
gemini-2.0-flash	Audio, images, videos, and text	Text, images (experimental), and audio (coming soon)	Next generation features, speed, thinking, realtime streaming, and multimodal generation
Gemini 2.0 Flash-Lite
gemini-2.0-flash-lite	Audio, images, videos, and text	Text	Cost efficiency and low latency
Gemini 1.5 Flash
gemini-1.5-flash	Audio, images, videos, and text	Text	Fast and versatile performance across a diverse variety of tasks
Gemini 1.5 Flash-8B
gemini-1.5-flash-8b	Audio, images, videos, and text	Text	High volume and lower intelligence tasks
Gemini 1.5 Pro
gemini-1.5-pro	Audio, images, videos, and text	Text	Complex reasoning tasks requiring more intelligence
Gemini Embedding
gemini-embedding-exp	Text	Text embeddings	Measuring the relatedness of text strings
Imagen 3
imagen-3.0-generate-002	Text	Images	Our most advanced image generation model
Veo 2
veo-2.0-generate-001	Text, images	Video	High quality video generation
Gemini 2.0 Flash Live
gemini-2.0-flash-live-001	Audio, video, and text	Text, audio	Low-latency bidirectional voice and video interactions

The Live API enables low-latency bidirectional voice and video interactions with Gemini. Using the Live API, you can provide end users with the experience of natural, human-like voice conversations, and with the ability to interrupt the model's responses using voice commands. The model can process text, audio, and video input, and it can provide text and audio output.


The Live API has new features and capabilities!

New capabilities:

Two new voices and 30 new languages, with configurable output language
Configurable image resolutions 66/256 tokens
Configurable turn coverage: Send all inputs all the time or only when the user is speaking
Configure if input should interrupt the model or not
Configurable Voice Activity Detection and new client events for end of turn signaling
Token counts
A client event for signaling end of stream
Text streaming
Configurable session resumption, with session data stored on the server for 24 hours
Longer session support with a sliding context window
New client events:

End of audio stream / mic closed
Activity start/end events for manually controlling turn transition
New server events:

Go away notification signaling a need to restart a session
Generation complete
Use the Live API
This section describes how to use the Live API with one of our SDKs. For more information about the underlying WebSockets API, see the WebSockets API reference.

Send and receive text

import asyncio
from google import genai

client = genai.Client(api_key="GEMINI_API_KEY")
model = "gemini-2.0-flash-live-001"

config = {"response_modalities": ["TEXT"]}

async def main():
    async with client.aio.live.connect(model=model, config=config) as session:
        while True:
            message = input("User> ")
            if message.lower() == "exit":
                break
            await session.send_client_content(
                turns={"role": "user", "parts": [{"text": message}]}, turn_complete=True
            )

            async for response in session.receive():
                if response.text is not None:
                    print(response.text, end="")

if __name__ == "__main__":
    asyncio.run(main())
Receive audio
The following example shows how to receive audio data and write it to a .wav file.


import asyncio
import wave
from google import genai

client = genai.Client(api_key="GEMINI_API_KEY", http_options={'api_version': 'v1alpha'})
model = "gemini-2.0-flash-live-001"

config = {"response_modalities": ["AUDIO"]}

async def main():
    async with client.aio.live.connect(model=model, config=config) as session:
        wf = wave.open("audio.wav", "wb")
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(24000)

        message = "Hello? Gemini are you there?"
        await session.send_client_content(
            turns={"role": "user", "parts": [{"text": message}]}, turn_complete=True
        )

        async for idx,response in async_enumerate(session.receive()):
            if response.data is not None:
                wf.writeframes(response.data)

            # Un-comment this code to print audio data info
            # if response.server_content.model_turn is not None:
            #      print(response.server_content.model_turn.parts[0].inline_data.mime_type)

        wf.close()

if __name__ == "__main__":
    asyncio.run(main())
Audio formats
The Live API supports the following audio formats:

Input audio format: Raw 16 bit PCM audio at 16kHz little-endian
Output audio format: Raw 16 bit PCM audio at 24kHz little-endian
Stream audio and video
To see an example of how to use the Live API in a streaming audio and video format, run the "Live API - Quickstart" file in the cookbooks repository:

System instructions
System instructions let you steer the behavior of a model based on your specific needs and use cases. System instructions can be set in the setup configuration and will remain in effect for the entire session.


from google.genai import types

config = {
    "system_instruction": types.Content(
        parts=[
            types.Part(
                text="You are a helpful assistant and answer in a friendly tone."
            )
        ]
    ),
    "response_modalities": ["TEXT"],
}
Incremental content updates
Use incremental updates to send text input, establish session context, or restore session context. For short contexts you can send turn-by-turn interactions to represent the exact sequence of events:

Python

turns = [
    {"role": "user", "parts": [{"text": "What is the capital of France?"}]},
    {"role": "model", "parts": [{"text": "Paris"}]},
]

await session.send_client_content(turns=turns, turn_complete=False)

turns = [{"role": "user", "parts": [{"text": "What is the capital of Germany?"}]}]

await session.send_client_content(turns=turns, turn_complete=True)
For longer contexts it's recommended to provide a single message summary to free up the context window for subsequent interactions.

Change voices
The Live API supports the following voices: Puck, Charon, Kore, Fenrir, Aoede, Leda, Orus, and Zephyr.

To specify a voice, set the voice name within the speechConfig object as part of the session configuration:

Python

from google.genai import types

config = types.LiveConnectConfig(
    response_modalities=["AUDIO"],
    speech_config=types.SpeechConfig(
        voice_config=types.VoiceConfig(
            prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="Kore")
        )
    )
)
Use function calling
You can define tools with the Live API. See the Function calling tutorial to learn more about function calling.

Tools must be defined as part of the session configuration:


config = types.LiveConnectConfig(
    response_modalities=["TEXT"],
    tools=[set_light_values]
)

async with client.aio.live.connect(model=model, config=config) as session:
    await session.send_client_content(
        turns={
            "role": "user",
            "parts": [{"text": "Turn the lights down to a romantic level"}],
        },
        turn_complete=True,
    )

    async for response in session.receive():
        print(response.tool_call)
From a single prompt, the model can generate multiple function calls and the code necessary to chain their outputs. This code executes in a sandbox environment, generating subsequent BidiGenerateContentToolCall messages. The execution pauses until the results of each function call are available, which ensures sequential processing.

The client should respond with BidiGenerateContentToolResponse.

Audio inputs and audio outputs negatively impact the model's ability to use function calling.

Handle interruptions
Users can interrupt the model's output at any time. When Voice activity detection (VAD) detects an interruption, the ongoing generation is canceled and discarded. Only the information already sent to the client is retained in the session history. The server then sends a BidiGenerateContentServerContent message to report the interruption.

In addition, the Gemini server discards any pending function calls and sends a BidiGenerateContentServerContent message with the IDs of the canceled calls.


async for response in session.receive():
    if response.server_content.interrupted is not None:
        # The generation was interrupted
Configure voice activity detection (VAD)
By default, the model automatically performs voice activity detection (VAD) on a continuous audio input stream. VAD can be configured with the realtimeInputConfig.automaticActivityDetection field of the setup configuration.

When the audio stream is paused for more than a second (for example, because the user switched off the microphone), an audioStreamEnd event should be sent to flush any cached audio. The client can resume sending audio data at any time.

Alternatively, the automatic VAD can be disabled by setting realtimeInputConfig.automaticActivityDetection.disabled to true in the setup message. In this configuration the client is responsible for detecting user speech and sending activityStart and activityEnd messages at the appropriate times. An audioStreamEnd isn't sent in this configuration. Instead, any interruption of the stream is marked by an activityEnd message.

SDK support for this feature will be available in the coming weeks.

Get the token count
You can find the total number of consumed tokens in the usageMetadata field of the returned server message.


from google.genai import types

async with client.aio.live.connect(
    model='gemini-2.0-flash-live-001',
    config=types.LiveConnectConfig(
        response_modalities=['AUDIO'],
    ),
) as session:
    # Session connected
    while True:
        await session.send_client_content(
            turns=types.Content(role='user', parts=[types.Part(text='Hello world!')])
        )
        async for message in session.receive():
            # The server will periodically send messages that include
            # UsageMetadata.
            if message.usage_metadata:
                usage = message.usage_metadata
                print(
                    f'Used {usage.total_token_count} tokens in total. Response token'
                    ' breakdown:'
                )
            for detail in usage.response_tokens_details:
                match detail:
                  case types.ModalityTokenCount(modality=modality, token_count=count):
                      print(f'{modality}: {count}')

            # For the purposes of this example, placeholder input is continually fed
            # to the model. In non-sample code, the model inputs would come from
            # the user.
            if message.server_content and message.server_content.turn_complete:
                break
Configure session resumption
To prevent session termination when the server periodically resets the WebSocket connection, configure the sessionResumption field within the setup configuration.

Passing this configuration causes the server to send SessionResumptionUpdate messages, which can be used to resume the session by passing the last resumption token as the SessionResumptionConfig.handle of the subsequent connection.


from google.genai import types

print(f"Connecting to the service with handle {previous_session_handle}...")
async with client.aio.live.connect(
    model="gemini-2.0-flash-live-001",
    config=types.LiveConnectConfig(
        response_modalities=["AUDIO"],
        session_resumption=types.SessionResumptionConfig(
            # The handle of the session to resume is passed here,
            # or else None to start a new session.
            handle=previous_session_handle
        ),
    ),
) as session:
    # Session connected
    while True:
        await session.send_client_content(
            turns=types.Content(
                role="user", parts=[types.Part(text="Hello world!")]
            )
        )
        async for message in session.receive():
            # Periodically, the server will send update messages that may
            # contain a handle for the current state of the session.
            if message.session_resumption_update:
                update = message.session_resumption_update
                if update.resumable and update.new_handle:
                    # The handle should be retained and linked to the session.
                    return update.new_handle

            # For the purposes of this example, placeholder input is continually fed
            # to the model. In non-sample code, the model inputs would come from
            # the user.
            if message.server_content and message.server_content.turn_complete:
                break
Receive a message before the session disconnects
The server sends a GoAway message that signals that the current connection will soon be terminated. This message includes the timeLeft, indicating the remaining time and lets you take further action before the connection will be terminated as ABORTED.

Receive a message when the generation is complete
The server sends a generationComplete message that signals that the model finished generating the response.

Enable context window compression
To enable longer sessions, and avoid abrupt connection termination, you can enable context window compression by setting the contextWindowCompression field as part of the session configuration.

In the ContextWindowCompressionConfig, you can configure a sliding-window mechanism and the number of tokens that triggers compression.


from google.genai import types

config = types.LiveConnectConfig(
    response_modalities=["AUDIO"],
    context_window_compression=(
        # Configures compression with default parameters.
        types.ContextWindowCompressionConfig(
            sliding_window=types.SlidingWindow(),
        )
    ),
)
Change the media resolution
You can specify the media resolution for the input media by setting the mediaResolution field as part of the session configuration:


from google.genai import types

config = types.LiveConnectConfig(
    response_modalities=["AUDIO"],
    media_resolution=types.MediaResolution.MEDIA_RESOLUTION_LOW,
)
Limitations
Consider the following limitations of the Live API and Gemini 2.0 when you plan your project.

Client authentication
The Live API only provides server to server authentication and isn't recommended for direct client use. Client input should be routed through an intermediate application server for secure authentication with the Live API.

Session duration
Session duration can be extended to unlimited by enabling session compression. Without compression, audio-only sessions are limited to 15 minutes, and audio plus video sessions are limited to 2 minutes. Exceeding these limits without compression will terminate the connection.

Context window
A session has a context window limit of 32k tokens.

Third-party integrations
For web and mobile app deployments, you can explore options from:

Daily
Livekit

Text generation

The Gemini API can generate text output in response to various inputs, including text, images, video, and audio. This guide shows you how to generate text using text and image inputs. It also covers streaming, chat, and system instructions.

Before you begin
Before calling the Gemini API, ensure you have your SDK of choice installed, and a Gemini API key configured and ready to use.

Text input
The simplest way to generate text using the Gemini API is to provide the model with a single text-only input, as shown in this example:

Python

from google import genai

client = genai.Client(api_key="GEMINI_API_KEY")

response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents=["How does AI work?"]
)
print(response.text)
Image input
The Gemini API supports multimodal inputs that combine text and media files. The following example shows how to generate text from text and image input:

Python

from PIL import Image
from google import genai

client = genai.Client(api_key="GEMINI_API_KEY")

image = Image.open("/path/to/organ.png")
response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents=[image, "Tell me about this instrument"]
)
print(response.text)
Streaming output
By default, the model returns a response after completing the entire text generation process. You can achieve faster interactions by using streaming to return instances of GenerateContentResponse as they're generated.

Python

from google import genai

client = genai.Client(api_key="GEMINI_API_KEY")

response = client.models.generate_content_stream(
    model="gemini-2.0-flash",
    contents=["Explain how AI works"]
)
for chunk in response:
    print(chunk.text, end="")
Multi-turn conversations
The Gemini SDK lets you collect multiple rounds of questions and responses into a chat. The chat format enables users to step incrementally toward answers and to get help with multipart problems. This SDK implementation of chat provides an interface to keep track of conversation history, but behind the scenes it uses the same generateContent method to create the response.

The following code example shows a basic chat implementation:

Python

from google import genai

client = genai.Client(api_key="GEMINI_API_KEY")
chat = client.chats.create(model="gemini-2.0-flash")

response = chat.send_message("I have 2 dogs in my house.")
print(response.text)

response = chat.send_message("How many paws are in my house?")
print(response.text)

for message in chat.get_history():
    print(f'role - {message.role}',end=": ")
    print(message.parts[0].text)
You can also use streaming with chat, as shown in the following example:

Python

from google import genai

client = genai.Client(api_key="GEMINI_API_KEY")
chat = client.chats.create(model="gemini-2.0-flash")

response = chat.send_message_stream("I have 2 dogs in my house.")
for chunk in response:
    print(chunk.text, end="")

response = chat.send_message_stream("How many paws are in my house?")
for chunk in response:
    print(chunk.text, end="")

for message in chat.get_history():
    print(f'role - {message.role}', end=": ")
    print(message.parts[0].text)
Configuration parameters
Every prompt you send to the model includes parameters that control how the model generates responses. You can configure these parameters, or let the model use the default options.

The following example shows how to configure model parameters:

Python

from google import genai
from google.genai import types

client = genai.Client(api_key="GEMINI_API_KEY")

response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents=["Explain how AI works"],
    config=types.GenerateContentConfig(
        max_output_tokens=500,
        temperature=0.1
    )
)
print(response.text)
Here are some of the model parameters you can configure. (Naming conventions vary by programming language.)

stopSequences: Specifies the set of character sequences (up to 5) that will stop output generation. If specified, the API will stop at the first appearance of a stop_sequence. The stop sequence won't be included as part of the response.
temperature: Controls the randomness of the output. Use higher values for more creative responses, and lower values for more deterministic responses. Values can range from [0.0, 2.0].
maxOutputTokens: Sets the maximum number of tokens to include in a candidate.
topP: Changes how the model selects tokens for output. Tokens are selected from the most to least probable until the sum of their probabilities equals the topP value. The default topP value is 0.95.
topK: Changes how the model selects tokens for output. A topK of 1 means the selected token is the most probable among all the tokens in the model's vocabulary, while a topK of 3 means that the next token is selected from among the 3 most probable using the temperature. Tokens are further filtered based on topP with the final token selected using temperature sampling.
System instructions
System instructions let you steer the behavior of a model based on your specific use case. When you provide system instructions, you give the model additional context to help it understand the task and generate more customized responses. The model should adhere to the system instructions over the full interaction with the user, enabling you to specify product-level behavior separate from the prompts provided by end users.

You can set system instructions when you initialize your model:

Python

from google import genai
from google.genai import types

client = genai.Client(api_key="GEMINI_API_KEY")

response = client.models.generate_content(
    model="gemini-2.0-flash",
    config=types.GenerateContentConfig(
        system_instruction="You are a cat. Your name is Neko."),
    contents="Hello there"
)

print(response.text)
Then, you can send requests to the model as usual.

Supported models
The entire Gemini family of models supports text generation. To learn more about the models and their capabilities, see Models.

Prompting tips
For basic text generation use cases, your prompt might not need to include any output examples, system instructions, or formatting information. This is a zero-shot approach. For some use cases, a one-shot or few-shot prompt might produce output that's more aligned with user expectations. In some cases, you might also want to provide system instructions to help the model understand the task or follow specific guidelines.

Generate images using Gemini
Gemini 2.0 Flash Experimental supports the ability to output text and inline images. This lets you use Gemini to conversationally edit images or generate outputs with interwoven text (for example, generating a blog post with text and images in a single turn). All generated images include a SynthID watermark, and images in Google AI Studio include a visible watermark as well.

Note: Make sure to include responseModalities: ["Text", "Image"] in your generation configuration for text and image output with gemini-2.0-flash-exp-image-generation. Image only is not allowed.
The following example shows how to use Gemini 2.0 to generate text-and-image output:

Python
JavaScript
REST

from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
import base64

client = genai.Client()

contents = ('Hi, can you create a 3d rendered image of a pig '
            'with wings and a top hat flying over a happy '
            'futuristic scifi city with lots of greenery?')

response = client.models.generate_content(
    model="gemini-2.0-flash-exp-image-generation",
    contents=contents,
    config=types.GenerateContentConfig(
      response_modalities=['Text', 'Image']
    )
)

for part in response.candidates[0].content.parts:
  if part.text is not None:
    print(part.text)
  elif part.inline_data is not None:
    image = Image.open(BytesIO((part.inline_data.data)))
    image.save('gemini-native-image.png')
    image.show()
AI-generated image of a fantastical flying pig
AI-generated image of a fantastical flying pig
Depending on the prompt and context, Gemini will generate content in different modes (text to image, text to image and text, etc.). Here are some examples:

Text to image
Example prompt: "Generate an image of the Eiffel tower with fireworks in the background."
Text to image(s) and text (interleaved)
Example prompt: "Generate an illustrated recipe for a paella."
Image(s) and text to image(s) and text (interleaved)
Example prompt: (With an image of a furnished room) "What other color sofas would work in my space? can you update the image?"
Image editing (text and image to image)
Example prompt: "Edit this image to make it look like a cartoon"
Example prompt: [image of a cat] + [image of a pillow] + "Create a cross stitch of my cat on this pillow."
Multi-turn image editing (chat)
Example prompts: [upload an image of a blue car.] "Turn this car into a convertible." "Now change the color to yellow."
Image editing with Gemini
To perform image editing, add an image as input. The following example demonstrats uploading base64 encoded images. For multiple images and larger payloads, check the image input section.

Python
JavaScript
REST

from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO

import PIL.Image

image = PIL.Image.open('/path/to/image.png')

client = genai.Client()

text_input = ('Hi, This is a picture of me.'
            'Can you add a llama next to me?',)

response = client.models.generate_content(
    model="gemini-2.0-flash-exp-image-generation",
    contents=[text_input, image],
    config=types.GenerateContentConfig(
      response_modalities=['Text', 'Image']
    )
)

for part in response.candidates[0].content.parts:
  if part.text is not None:
    print(part.text)
  elif part.inline_data is not None:
    image = Image.open(BytesIO(part.inline_data.data))
    image.show()
Limitations
For best performance, use the following languages: EN, es-MX, ja-JP, zh-CN, hi-IN.
Image generation does not support audio or video inputs.
Image generation may not always trigger:
The model may output text only. Try asking for image outputs explicitly (e.g. "generate an image", "provide images as you go along", "update the image").
The model may stop generating partway through. Try again or try a different prompt.
When generating text for an image, Gemini works best if you first generate the text and then ask for an image with the text.
Choose a model
Which model should you use to generate images? It depends on your use case.

Gemini 2.0 is best for producing contextually relevant images, blending text + images, incorporating world knowledge, and reasoning about images. You can use it to create accurate, contextually relevant visuals embedded in long text sequences. You can also edit images conversationally, using natural language, while maintaining context throughout the conversation.

If image quality is your top priority, then Imagen 3 is a better choice. Imagen 3 excels at photorealism, artistic detail, and specific artistic styles like impressionism or anime. Imagen 3 is also a good choice for specialized image editing tasks like updating product backgrounds, upscaling images, and infusing branding and style into visuals. You can use Imagen 3 to create logos or other branded product designs.

Generate images using Imagen 3
The Gemini API provides access to Imagen 3, Google's highest quality text-to-image model, featuring a number of new and improved capabilities. Imagen 3 can do the following:

Generate images with better detail, richer lighting, and fewer distracting artifacts than previous models
Understand prompts written in natural language
Generate images in a wide range of formats and styles
Render text more effectively than previous models
Note: Imagen 3 is only available on the Paid Tier and always includes a SynthID watermark.
Python

from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO

client = genai.Client(api_key='GEMINI_API_KEY')

response = client.models.generate_images(
    model='imagen-3.0-generate-002',
    prompt='Robot holding a red skateboard',
    config=types.GenerateImagesConfig(
        number_of_images= 4,
    )
)
for generated_image in response.generated_images:
  image = Image.open(BytesIO(generated_image.image.image_bytes))
  image.show()
AI-generated image of two fuzzy bunnies in the kitchen
AI-generated image of two fuzzy bunnies in the kitchen
Imagen supports English only prompts at this time and the following parameters:

Imagen model parameters
(Naming conventions vary by programming language.)

numberOfImages: The number of images to generate, from 1 to 4 (inclusive). The default is 4.
aspectRatio: Changes the aspect ratio of the generated image. Supported values are "1:1", "3:4", "4:3", "9:16", and "16:9". The default is "1:1".
personGeneration: Allow the model to generate images of people. The following values are supported:
"DONT_ALLOW": Block generation of images of people.
"ALLOW_ADULT": Generate images of adults, but not children. This is the default.

Generate video using Veo

The Gemini API provides access to Veo 2, Google's state-of-the-art video generation model. Veo is designed to help you build next-generation AI applications that transform user prompts and images into high quality video assets.

This guide will help you get started with Veo using the Gemini API.

About Veo
Note: Veo is a paid feature and will not run in the Free tier. Visit the Pricing page for more details.
Veo is Google's most capable video generation model to date. It generates videos in a wide range of cinematic and visual styles, capturing prompt nuance to render intricate details consistently across frames.

To learn more and see example output, check out the Google DeepMind Veo overview.

Specifications
Modalities	
Text-to-video generation
Image-to-video generation
Request latency	
Min: 11 seconds
Max: 6 minutes (during peak hours)
Variable length generation	5-8 seconds
Resolution	720p
Frame rate	24fps
Aspect ratio	
16:9 - landscape
9:16 - portrait
Input languages (text-to-video)	English
Note: Check out the Models, Pricing, and Rate limits pages for more usage limitations for Veo.
Videos created by Veo are watermarked using SynthID, our tool for watermarking and identifying AI-generated content, and are passed through safety filters and memorization checking processes that help mitigate privacy, copyright and bias risks.

Before you begin
Before calling the Gemini API, ensure you have your SDK of choice installed, and a Gemini API key configured and ready to use.

To use Veo with the Google Gen AI SDKs, ensure that you have one of the following versions installed:

Python v1.10.0 or later
TypeScript and JavaScript v0.8.0 or later
Go v1.0.0 or later
Generate videos
This section provides code examples for generating videos using text prompts and using images.

Generate from text
You can use the following code to generate videos with Veo:

Python
REST

import time
from google import genai
from google.genai import types

client = genai.Client()  # read API key from GOOGLE_API_KEY

operation = client.models.generate_videos(
    model="veo-2.0-generate-001",
    prompt="Panning wide shot of a calico kitten sleeping in the sunshine",
    config=types.GenerateVideosConfig(
        person_generation="dont_allow",  # "dont_allow" or "allow_adult"
        aspect_ratio="16:9",  # "16:9" or "9:16"
    ),
)

while not operation.done:
    time.sleep(20)
    operation = client.operations.get(operation)

for n, generated_video in enumerate(operation.response.generated_videos):
    client.files.download(file=generated_video.video)
    generated_video.video.save(f"video{n}.mp4")  # save the video

Kitten sleeping in the sun.

This code takes about 2-3 minutes to run, though it may take longer if resources are constrained. Once it's done running, you should see a video that looks something like this:

If you see an error message instead of a video, this means that resources are constrained and your request couldn't be completed. In this case, run the code again.

Generated videos are stored on the server for 2 days, after which they are removed. If you want to save a local copy of your generated video, you must run result() and save() within 2 days of generation.

Generate from images
You can also generate videos using images. The following code generates an image using Imagen, then uses the generated image as the starting frame for the generated video.

First, generate an image using Imagen:

Python

prompt="Panning wide shot of a calico kitten sleeping in the sunshine",

imagen = client.models.generate_images(
    model="imagen-3.0-generate-002",
    prompt=prompt,
    config=types.GenerateImagesConfig(
      aspect_ratio="16:9",
      number_of_images=1
    )
)

images[0]
Then, generate a video using the resulting image as the first frame:

Python

operation = client.models.generate_videos(
    model="veo-2.0-generate-001",
    prompt=prompt,
    image = images[0],
    config=types.GenerateVideosConfig(
      # person_generation only accepts "dont_allow" for image-to-video
      aspect_ratio="16:9",  # "16:9" or "9:16"
      number_of_videos=2
    ),
)

# Wait for videos to generate
 while not operation.done:
  time.sleep(20)
  operation = client.operations.get(operation)

for n, video in enumerate(operation.response.generated_videos):
    fname = f'with_image_input{n}.mp4'
    print(fname)
    video.save(fname)
Veo model parameters
(Naming conventions vary by programming language.)

prompt: The text prompt for the video. When present, the image parameter is optional.
image: The image to use as the first frame for the video. When present, the prompt parameter is optional.
negativePrompt: Text string that describes anything you want to discourage the model from generating
aspectRatio: Changes the aspect ratio of the generated video. Supported values are "16:9" and "9:16". The default is "16:9".
personGeneration: Allow the model to generate videos of people. The following values are supported:
Text-to-video generation:
"dont_allow": Don't allow the inclusion of people or faces.
"allow_adult": Generate videos that include adults, but not children.
Image-to-video generation:
"dont_allow": Default and only value for image-to-video generation.
numberOfVideos: Output videos requested, either 1 or 2.
durationSeconds: Length of each output video in seconds, between 5 and 8.
enhance_prompt: Enable or disable the prompt rewriter. Enabled by default.
Things to try
To get the most out of Veo, incorporate video-specific terminology into your prompts. Veo understands a wide range of terms related to:

Shot composition: Specify the framing and number of subjects in the shot (e.g., "single shot," "two shot," "over-the-shoulder shot").
Camera positioning and movement: Control the camera's location and movement using terms like "eye level," "high angle," "worms eye," "dolly shot," "zoom shot," "pan shot," and "tracking shot."
Focus and lens effects: Use terms like "shallow focus," "deep focus," "soft focus," "macro lens," and "wide-angle lens" to achieve specific visual effects.
Overall style and subject: Guide Veo's creative direction by specifying styles like "sci-fi," "romantic comedy," "action movie," or "animation." You can also describe the subjects and backgrounds you want, such as "cityscape," "nature," "vehicles," or "animals."
Veo prompt guide
This section of the Veo guide contains examples of videos you can create using Veo, and shows you how to modify prompts to produce distinct results.

Safety filters
Veo applies safety filters across Gemini to help ensure that generated videos and uploaded photos don't contain offensive content. Prompts that violate our terms and guidelines are blocked.

Prompt writing basics
Good prompts are descriptive and clear. To get your generated video as close as possible to what you want, start with identifying your core idea, and then refine your idea by adding keywords and modifiers.

The following elements should be included in your prompt:

Subject: The object, person, animal, or scenery that you want in your video.
Context: The background or context in which the subject is placed.
Action: What the subject is doing (for example, walking, running, or turning their head).
Style: This can be general or very specific. Consider using specific film style keywords, such as horror film, film noir, or animated styles like cartoon style.
Camera motion: [Optional] What the camera is doing, such as aerial view, eye-level, top-down shot, or low-angle shot.
Composition: [Optional] How the shot is framed, such as wide shot, close-up, or extreme close-up.
Ambiance: [Optional] How the color and light contribute to the scene, such as blue tones, night, or warm tones.
More tips for writing prompts
The following tips help you write prompts that generate your videos:

Use descriptive language: Use adjectives and adverbs to paint a clear picture for Veo.
Provide context: If necessary, include background information to help your model understand what you want.
Reference specific artistic styles: If you have a particular aesthetic in mind, reference specific artistic styles or art movements.
Utilize prompt engineering tools: Consider exploring prompt engineering tools or resources to help you refine your prompts and achieve optimal results. For more information, visit Introduction to prompt design.
Enhance the facial details in your personal and group images: Specify facial details as a focus of the photo like using the word portrait in the prompt.

Gemini models are able to process images and videos, enabling many frontier developer use cases that would have historically required domain specific models. Some of Gemini's vision capabilities include the ability to:

Caption and answer questions about images
Transcribe and reason over PDFs, including up to 2 million tokens
Describe, segment, and extract information from videos up to 90 minutes long
Detect objects in an image and return bounding box coordinates for them
Gemini was built to be multimodal from the ground up and we continue to push the frontier of what is possible.

Before you begin
Before calling the Gemini API, ensure you have your SDK of choice installed, and a Gemini API key configured and ready to use.

Image input
For total image payload size less than 20MB, we recommend either uploading base64 encoded images or directly uploading locally stored image files.

Working with local images
If you are using the Python imaging library (Pillow), you can use PIL image objects too.


from google import genai
from google.genai import types

import PIL.Image

image = PIL.Image.open('/path/to/image.png')

client = genai.Client(api_key="GEMINI_API_KEY")
response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents=["What is this image?", image])

print(response.text)
Base64 encoded images
You can upload public image URLs by encoding them as Base64 payloads. The following code example shows how to do this using only standard library tools:


from google import genai
from google.genai import types

import requests

image_path = "https://goo.gle/instrument-img"
image = requests.get(image_path)

client = genai.Client(api_key="GEMINI_API_KEY")
response = client.models.generate_content(
    model="gemini-2.0-flash-exp",
    contents=["What is this image?",
              types.Part.from_bytes(data=image.content, mime_type="image/jpeg")])

print(response.text)
Multiple images
To prompt with multiple images, you can provide multiple images in the call to generate_content. These can be in any supported format, including base64 or PIL.


from google import genai
from google.genai import types

import pathlib
import PIL.Image

image_path_1 = "path/to/your/image1.jpeg"  # Replace with the actual path to your first image
image_path_2 = "path/to/your/image2.jpeg" # Replace with the actual path to your second image

image_url_1 = "https://goo.gle/instrument-img" # Replace with the actual URL to your third image

pil_image = PIL.Image.open(image_path_1)

b64_image = types.Part.from_bytes(
    data=pathlib.Path(image_path_2).read_bytes(),
    mime_type="image/jpeg"
)

downloaded_image = requests.get(image_url_1)

client = genai.Client(api_key="GEMINI_API_KEY")
response = client.models.generate_content(
    model="gemini-2.0-flash-exp",
    contents=["What do these images have in common?",
              pil_image, b64_image, downloaded_image])

print(response.text)
Note that these inline data calls don't include many of the features available through the File API, such as getting file metadata, listing, or deleting files.

Large image payloads
When the combination of files and system instructions that you intend to send is larger than 20 MB in size, use the File API to upload those files.

Use the media.upload method of the File API to upload an image of any size.

Note: The File API lets you store up to 20 GB of files per project, with a per-file maximum size of 2 GB. Files are stored for 48 hours. They can be accessed in that period with your API key, but cannot be downloaded from the API. It is available at no cost in all regions where the Gemini API is available.
After uploading the file, you can make GenerateContent requests that reference the File API URI. Select the generative model and provide it with a text prompt and the uploaded image.


from google import genai

client = genai.Client(api_key="GEMINI_API_KEY")

img_path = "/path/to/Cajun_instruments.jpg"
file_ref = client.files.upload(file=img_path)
print(f'{file_ref=}')

client = genai.Client(api_key="GEMINI_API_KEY")
response = client.models.generate_content(
    model="gemini-2.0-flash-exp",
    contents=["What can you tell me about these instruments?",
              file_ref])

print(response.text)
OpenAI Compatibility
You can access Gemini's image understanding capabilities using the OpenAI libraries. This lets you integrate Gemini into existing OpenAI workflows by updating three lines of code and using your Gemini API key. See the Image understanding example for code demonstrating how to send images encoded as Base64 payloads.

Prompting with images
In this tutorial, you will upload images using the File API or as inline data and generate content based on those images.

Technical details (images)
Gemini 2.0 Flash, 1.5 Pro, and 1.5 Flash support a maximum of 3,600 image files.

Images must be in one of the following image data MIME types:

PNG - image/png
JPEG - image/jpeg
WEBP - image/webp
HEIC - image/heic
HEIF - image/heif
Tokens
Here's how tokens are calculated for images:

Gemini 1.0 Pro Vision: Each image accounts for 258 tokens.
Gemini 1.5 Flash and Gemini 1.5 Pro: If both dimensions of an image are less than or equal to 384 pixels, then 258 tokens are used. If one dimension of an image is greater than 384 pixels, then the image is cropped into tiles. Each tile size defaults to the smallest dimension (width or height) divided by 1.5. If necessary, each tile is adjusted so that it's not smaller than 256 pixels and not greater than 768 pixels. Each tile is then resized to 768x768 and uses 258 tokens.
Gemini 2.0 Flash: Image inputs with both dimensions <=384 pixels are counted as 258 tokens. Images larger in one or both dimensions are cropped and scaled as needed into tiles of 768x768 pixels, each counted as 258 tokens.
For best results
Rotate images to the correct orientation before uploading.
Avoid blurry images.
If using a single image, place the text prompt after the image.
Capabilities
This section outlines specific vision capabilities of the Gemini model, including object detection and bounding box coordinates.

Get a bounding box for an object
Gemini models are trained to return bounding box coordinates as relative widths or heights in the range of [0, 1]. These values are then scaled by 1000 and converted to integers. Effectively, the coordinates represent the bounding box on a 1000x1000 pixel version of the image. Therefore, you'll need to convert these coordinates back to the dimensions of your original image to accurately map the bounding boxes.


from google import genai

client = genai.Client(api_key="GEMINI_API_KEY")

prompt = (
  "Return a bounding box for each of the objects in this image "
  "in [ymin, xmin, ymax, xmax] format.")

response = client.models.generate_content(
  model="gemini-1.5-pro",
  contents=[sample_file_1, prompt])

print(response.text)
You can use bounding boxes for object detection and localization within images and video. By accurately identifying and delineating objects with bounding boxes, you can unlock a wide range of applications and enhance the intelligence of your projects.

Key Benefits
Simple: Integrate object detection capabilities into your applications with ease, regardless of your computer vision expertise.
Customizable: Produce bounding boxes based on custom instructions (e.g. "I want to see bounding boxes of all the green objects in this image"), without having to train a custom model.
Technical Details
Input: Your prompt and associated images or video frames.
Output: Bounding boxes in the [y_min, x_min, y_max, x_max] format. The top left corner is the origin. The x and y axis go horizontally and vertically, respectively. Coordinate values are normalized to 0-1000 for every image.
Visualization: AI Studio users will see bounding boxes plotted within the UI.
For Python developers, try the 2D spatial understanding notebook or the experimental 3D pointing notebook.

Normalize coordinates
The model returns bounding box coordinates in the format [y_min, x_min, y_max, x_max]. To convert these normalized coordinates to the pixel coordinates of your original image, follow these steps:

Divide each output coordinate by 1000.
Multiply the x-coordinates by the original image width.
Multiply the y-coordinates by the original image height.
To explore more detailed examples of generating bounding box coordinates and visualizing them on images, we encourage you to review our Object Detection cookbook example.

Image segmentation
Starting with the 2.5 generation, Gemini models are trained to not only detect items but segment them and provide a mask of their contour.

The model predicts a JSON list, where each item represents a segmentation mask. Each item has a bounding box ("box_2d") in the format [y0, x0, y1, x1] with normalized coordinates between 0 and 1000, a label ("label") that identifies the object, and finally the segmentation mask inside the bounding box, as base64 encoded png that is a probability map with values between 0 and 255. The mask needs to be resized to match the bounding box dimensions, then binarized at your confidence threshold (127 for the midpoint).


from google import genai

client = genai.Client(api_key="GEMINI_API_KEY")

prompt = """
  Give the segmentation masks for the wooden and glass items.
  Output a JSON list of segmentation masks where each entry contains the 2D
  bounding box in the key "box_2d", the segmentation mask in key "mask", and
  the text label in the key "label". Use descriptive labels.
"""

response = client.models.generate_content(
  model="gemini-2.5-pro-exp-03-25",
  contents=[sample_file_1, prompt])

print(response.text)
A table with cupcakes, with the wooden and glass objects highlighted
Mask of the wooden and glass objects found on the picture
Check the segmentation example in the cookbook guide for a more detailed example.

Prompting with video
In this tutorial, you will upload a video using the File API and generate content based on those images.

Technical details (video)
Gemini 1.5 Pro and Flash support up to approximately an hour of video data.

Video must be in one of the following video format MIME types:

video/mp4
video/mpeg
video/mov
video/avi
video/x-flv
video/mpg
video/webm
video/wmv
video/3gpp
The File API service extracts image frames from videos at 1 frame per second (FPS) and audio at 1Kbps, single channel, adding timestamps every second. These rates are subject to change in the future for improvements in inference.

Note: The details of fast action sequences may be lost at the 1 FPS frame sampling rate. Consider slowing down high-speed clips for improved inference quality.
Individual frames are 258 tokens, and audio is 32 tokens per second. With metadata, each second of video becomes ~300 tokens, which means a 1M context window can fit slightly less than an hour of video. As a result, Gemini Pro, which has a 2M context window, can handle a maximum video length of 2 hours, and Gemini Flash, which has a 1M context window, can handle a maximum video length of 1 hour.

To ask questions about time-stamped locations, use the format MM:SS, where the first two digits represent minutes and the last two digits represent seconds.

For best results:

Use one video per prompt.
If using a single video, place the text prompt after the video.
Upload a video file using the File API
Note: The File API lets you store up to 20 GB of files per project, with a per-file maximum size of 2 GB. Files are stored for 48 hours. They can be accessed in that period with your API key, but they cannot be downloaded using any API. It is available at no cost in all regions where the Gemini API is available.
The File API accepts video file formats directly. This example uses the short NASA film "Jupiter's Great Red Spot Shrinks and Grows". Credit: Goddard Space Flight Center (GSFC)/David Ladd (2018).

"Jupiter's Great Red Spot Shrinks and Grows" is in the public domain and does not show identifiable people. (NASA image and media usage guidelines.)

Start by retrieving the short video:


wget https://storage.googleapis.com/generativeai-downloads/images/GreatRedSpot.mp4
Upload the video using the File API and print the URI.


from google import genai

client = genai.Client(api_key="GEMINI_API_KEY")

print("Uploading file...")
video_file = client.files.upload(file="GreatRedSpot.mp4")
print(f"Completed upload: {video_file.uri}")
Verify file upload and check state
Verify the API has successfully received the files by calling the files.get method.

Note: Video files have a State field in the File API. When a video is uploaded, it will be in the PROCESSING state until it is ready for inference. Only ACTIVE files can be used for model inference.

import time

# Check whether the file is ready to be used.
while video_file.state.name == "PROCESSING":
    print('.', end='')
    time.sleep(1)
    video_file = client.files.get(name=video_file.name)

if video_file.state.name == "FAILED":
  raise ValueError(video_file.state.name)

print('Done')
Prompt with a video and text
Once the uploaded video is in the ACTIVE state, you can make GenerateContent requests that specify the File API URI for that video. Select the generative model and provide it with the uploaded video and a text prompt.


from IPython.display import Markdown

# Pass the video file reference like any other media part.
response = client.models.generate_content(
    model="gemini-1.5-pro",
    contents=[
        video_file,
        "Summarize this video. Then create a quiz with answer key "
        "based on the information in the video."])

# Print the response, rendering any Markdown
Markdown(response.text)
Upload a video inline
If your video is less than 20MB, you can include it inline with your request as a data Part.

Here's an example of uploading a video inline:


# Only for videos of size <20Mb
video_file_name = "/path/to/your/video.mp4"
video_bytes = open(video_file_name, 'rb').read()

response = client.models.generate_content(
    model='models/gemini-2.0-flash',
    contents=types.Content(
        parts=[
            types.Part(text='Can you summarize this video?'),
            types.Part(
                inline_data=types.Blob(data=video_bytes, mime_type='video/mp4')
            )
        ]
    )
)
Include a YouTube URL
Preview: The YouTube URL feature is in preview and is currently free of charge. Pricing and rate limits are likely to change.
The Gemini API and AI Studio support YouTube URLs as a file data Part. You can include a YouTube URL with a prompt asking the model to summarize, translate, or otherwise interact with the video content.

Limitations:

You can't upload more than 8 hours of YouTube video per day.
You can upload only 1 video per request.
You can only upload public videos (not private or unlisted videos).
Note: Gemini Pro, which has a 2M context window, can handle a maximum video length of 2 hours, and Gemini Flash, which has a 1M context window, can handle a maximum video length of 1 hour.
The following example shows how to include a YouTube URL with a prompt:


response = client.models.generate_content(
    model='models/gemini-2.0-flash',
    contents=types.Content(
        parts=[
            types.Part(text='Can you summarize this video?'),
            types.Part(
                file_data=types.FileData(file_uri='https://www.youtube.com/watch?v=9hE5-98ZeCg')
            )
        ]
    )
)
Refer to timestamps in the content
You can use timestamps of the form MM:SS to refer to specific moments in the video.


prompt = "What are the examples given at 01:05 and 01:19 supposed to show us?"

response = client.models.generate_content(
    model="gemini-1.5-pro",
    contents=[video_file, prompt])

print(response.text)
Transcribe video and provide visual descriptions
The Gemini models can transcribe and provide visual descriptions of video content by processing both the audio track and visual frames. For visual descriptions, the model samples the video at a rate of 1 frame per second. This sampling rate may affect the level of detail in the descriptions, particularly for videos with rapidly changing visuals.


prompt = (
    "Transcribe the audio from this video, giving timestamps for "
    "salient events in the video. Also provide visual descriptions.")

response = client.models.generate_content(
    model="gemini-1.5-pro",
    contents=[video_file, prompt])

print(response.text)
List files
You can list all files uploaded using the File API and their URIs using files.list.


from google import genai

client = genai.Client(api_key="GEMINI_API_KEY")

print('My files:')
for f in client.files.list():
  print(" ", f'{f.name}: {f.uri}')
Delete files
Files uploaded using the File API are automatically deleted after 2 days. You can also manually delete them using files.delete.


from google import genai

client = genai.Client(api_key="GEMINI_API_KEY")

# Upload a file
poem_file = client.files.upload(file="poem.txt")

# Files will auto-delete after a period.
print(poem_file.expiration_time)

# Or they can be deleted explicitly.
dr = client.files.delete(name=poem_file.name)

try:
  client.models.generate_content(
      model="gemini-2.0-flash-exp",
      contents=['Finish this poem:', poem_file])
except genai.errors.ClientError as e:
  print(e.code)  # 403
  print(e.status)  # PERMISSION_DENIED
  print(e.message)  # You do not have permission to access the File .. or it may not exist.

Audio understanding

Gemini can analyze and understand audio input, enabling use cases like the following:

Describe, summarize, or answer questions about audio content.
Provide a transcription of the audio.
Analyze specific segments of the audio.
This guide shows you how to use the Gemini API to generate a text response to audio input.

Before you begin
Before calling the Gemini API, ensure you have your SDK of choice installed, and a Gemini API key configured and ready to use.

Input audio
You can provide audio data to Gemini in the following ways:

Upload an audio file before making a request to generateContent.
Pass inline audio data with the request to generateContent.
Upload an audio file
You can use the Files API to upload an audio file. Always use the Files API when the total request size (including the files, text prompt, system instructions, etc.) is larger than 20 MB.

The following code uploads an audio file and then uses the file in a call to generateContent.

Python

from google import genai

client = genai.Client(api_key="GOOGLE_API_KEY")

myfile = client.files.upload(file="path/to/sample.mp3")

response = client.models.generate_content(
    model="gemini-2.0-flash", contents=["Describe this audio clip", myfile]
)

print(response.text)
To learn more about working with media files, see Files API.

Pass audio data inline
Instead of uploading an audio file, you can pass inline audio data in the request to generateContent:

Python

from google.genai import types

with open('path/to/small-sample.mp3', 'rb') as f:
    audio_bytes = f.read()

response = client.models.generate_content(
  model='gemini-2.0-flash',
  contents=[
    'Describe this audio clip',
    types.Part.from_bytes(
      data=audio_bytes,
      mime_type='audio/mp3',
    )
  ]
)

print(response.text)
A few things to keep in mind about inline audio data:

The maximum request size is 20 MB, which includes text prompts, system instructions, and files provided inline. If your file's size will make the total request size exceed 20 MB, then use the Files API to upload an audio file for use in the request.
If you're using an audio sample multiple times, it's more efficient to upload an audio file.
Get a transcript
To get a transcript of audio data, just ask for it in the prompt:

Python

myfile = client.files.upload(file='path/to/sample.mp3')
prompt = 'Generate a transcript of the speech.'

response = client.models.generate_content(
  model='gemini-2.0-flash',
  contents=[prompt, myfile]
)

print(response.text)
Refer to timestamps
You can refer to specific sections of an audio file using timestamps of the form MM:SS. For example, the following prompt requests a transcript that

Starts at 2 minutes 30 seconds from the beginning of the file.
Ends at 3 minutes 29 seconds from the beginning of the file.

Python

# Create a prompt containing timestamps.
prompt = "Provide a transcript of the speech from 02:30 to 03:29."
Count tokens
Call the countTokens method to get a count of the number of tokens in an audio file. For example:

Python

response = client.models.count_tokens(
  model='gemini-2.0-flash',
  contents=[myfile]
)

print(response)
Supported audio formats
Gemini supports the following audio format MIME types:

WAV - audio/wav
MP3 - audio/mp3
AIFF - audio/aiff
AAC - audio/aac
OGG Vorbis - audio/ogg
FLAC - audio/flac
Technical details about audio
Gemini represents each second of audio as 32 tokens; for example, one minute of audio is represented as 1,920 tokens.
Gemini can only infer responses to English-language speech.
Gemini can "understand" non-speech components, such as birdsong or sirens.
The maximum supported length of audio data in a single prompt is 9.5 hours. Gemini doesn't limit the number of audio files in a single prompt; however, the total combined length of all audio files in a single prompt can't exceed 9.5 hours.
Gemini downsamples audio files to a 16 Kbps data resolution.
If the audio source contains multiple channels, Gemini combines those channels into a single channel.

Long context

Gemini 2.0 Flash and Gemini 1.5 Flash come with a 1-million-token context window, and Gemini 1.5 Pro comes with a 2-million-token context window. Historically, large language models (LLMs) were significantly limited by the amount of text (or tokens) that could be passed to the model at one time. The Gemini 1.5 long context window, with near-perfect retrieval (>99%), unlocks many new use cases and developer paradigms.

The code you already use for cases like text generation or multimodal inputs will work out of the box with long context.

Throughout this guide, you briefly explore the basics of the context window, how developers should think about long context, various real world use cases for long context, and ways to optimize the usage of long context.

What is a context window?
The basic way you use the Gemini models is by passing information (context) to the model, which will subsequently generate a response. An analogy for the context window is short term memory. There is a limited amount of information that can be stored in someone's short term memory, and the same is true for generative models.

You can read more about how models work under the hood in our generative models guide.

Getting started with long context
Most generative models created in the last few years were only capable of processing 8,000 tokens at a time. Newer models pushed this further by accepting 32,000 tokens or 128,000 tokens. Gemini 1.5 is the first model capable of accepting 1 million tokens, and now 2 million tokens with Gemini 1.5 Pro.

In practice, 1 million tokens would look like:

50,000 lines of code (with the standard 80 characters per line)
All the text messages you have sent in the last 5 years
8 average length English novels
Transcripts of over 200 average length podcast episodes
Even though the models can take in more and more context, much of the conventional wisdom about using large language models assumes this inherent limitation on the model, which as of 2024, is no longer the case.

Some common strategies to handle the limitation of small context windows included:

Arbitrarily dropping old messages / text from the context window as new text comes in
Summarizing previous content and replacing it with the summary when the context window gets close to being full
Using RAG with semantic search to move data out of the context window and into a vector database
Using deterministic or generative filters to remove certain text / characters from prompts to save tokens
While many of these are still relevant in certain cases, the default place to start is now just putting all of the tokens into the context window. Because Gemini models were purpose-built with a long context window, they are much more capable of in-context learning. For example, with only instructional materials (a 500-page reference grammar, a dictionary, and ≈ 400 extra parallel sentences) all provided in context, Gemini 1.5 Pro and Gemini 1.5 Flash are capable of learning to translate from English to Kalamang— a Papuan language with fewer than 200 speakers and therefore almost no online presence—with quality similar to a person who learned from the same materials.

This example underscores how you can start to think about what is possible with long context and the in-context learning capabilities of Gemini models.

Long context use cases
While the standard use case for most generative models is still text input, the Gemini 1.5 model family enables a new paradigm of multimodal use cases. These models can natively understand text, video, audio, and images. They are accompanied by the Gemini API that takes in multimodal file types for convenience.

Long form text
Text has proved to be the layer of intelligence underpinning much of the momentum around LLMs. As mentioned earlier, much of the practical limitation of LLMs was because of not having a large enough context window to do certain tasks. This led to the rapid adoption of retrieval augmented generation (RAG) and other techniques which dynamically provide the model with relevant contextual information. Now, with larger and larger context windows (currently up to 2 million on Gemini 1.5 Pro), there are new techniques becoming available which unlock new use cases.

Some emerging and standard use cases for text based long context include:

Summarizing large corpuses of text
Previous summarization options with smaller context models would require a sliding window or another technique to keep state of previous sections as new tokens are passed to the model
Question and answering
Historically this was only possible with RAG given the limited amount of context and models' factual recall being low
Agentic workflows
Text is the underpinning of how agents keep state of what they have done and what they need to do; not having enough information about the world and the agent's goal is a limitation on the reliability of agents
Many-shot in-context learning is one of the most unique capabilities unlocked by long context models. Research has shown that taking the common "single shot" or "multi-shot" example paradigm, where the model is presented with one or a few examples of a task, and scaling that up to hundreds, thousands, or even hundreds of thousands of examples, can lead to novel model capabilities. This many-shot approach has also been shown to perform similarly to models which were fine-tuned for a specific task. For use cases where a Gemini model's performance is not yet sufficient for a production rollout, you can try the many-shot approach. As you might explore later in the long context optimization section, context caching makes this type of high input token workload much more economically feasible and even lower latency in some cases.

Long form video
Video content's utility has long been constrained by the lack of accessibility of the medium itself. It was hard to skim the content, transcripts often failed to capture the nuance of a video, and most tools don't process image, text, and audio together. With Gemini 1.5, the long-context text capabilities translate to the ability to reason and answer questions about multimodal inputs with sustained performance. Gemini 1.5 Flash, when tested on the needle in a video haystack problem with 1M tokens, obtained >99.8% recall of the video in the context window, and 1.5 Pro reached state of the art performance on the Video-MME benchmark.

Some emerging and standard use cases for video long context include:

Video question and answering
Video memory, as shown with Google's Project Astra
Video captioning
Video recommendation systems, by enriching existing metadata with new multimodal understanding
Video customization, by looking at a corpus of data and associated video metadata and then removing parts of videos that are not relevant to the viewer
Video content moderation
Real-time video processing
When working with videos, it is important to consider how the videos are processed into tokens, which affects billing and usage limits. You can learn more about prompting with video files in the Prompting guide.

Long form audio
The Gemini 1.5 models were the first natively multimodal large language models that could understand audio. Historically, the typical developer workflow would involve stringing together multiple domain specific models, like a speech-to-text model and a text-to-text model, in order to process audio. This led to additional latency required by performing multiple round-trip requests and decreased performance usually attributed to disconnected architectures of the multiple model setup.

On standard audio-haystack evaluations, Gemini 1.5 Pro is able to find the hidden audio in 100% of the tests and Gemini 1.5 Flash is able to find it in 98.7% of the tests. Gemini 1.5 Flash accepts up to 9.5 hours of audio in a single request and Gemini 1.5 Pro can accept up to 19 hours of audio using the 2-million-token context window. Further, on a test set of 15-minute audio clips, Gemini 1.5 Pro archives a word error rate (WER) of ~5.5%, much lower than even specialized speech-to-text models, without the added complexity of extra input segmentation and pre-processing.

Some emerging and standard use cases for audio context include:

Real-time transcription and translation
Podcast / video question and answering
Meeting transcription and summarization
Voice assistants
You can learn more about prompting with audio files in the Prompting guide.

Long context optimizations
The primary optimization when working with long context and the Gemini 1.5 models is to use context caching. Beyond the previous impossibility of processing lots of tokens in a single request, the other main constraint was the cost. If you have a "chat with your data" app where a user uploads 10 PDFs, a video, and some work documents, you would historically have to work with a more complex retrieval augmented generation (RAG) tool / framework in order to process these requests and pay a significant amount for tokens moved into the context window. Now, you can cache the files the user uploads and pay to store them on a per hour basis. The input / output cost per request with Gemini 1.5 Flash for example is ~4x less than the standard input / output cost, so if the user chats with their data enough, it becomes a huge cost saving for you as the developer.

Long context limitations
In various sections of this guide, we talked about how Gemini 1.5 models achieve high performance across various needle-in-a-haystack retrieval evals. These tests consider the most basic setup, where you have a single needle you are looking for. In cases where you might have multiple "needles" or specific pieces of information you are looking for, the model does not perform with the same accuracy. Performance can vary to a wide degree depending on the context. This is important to consider as there is an inherent tradeoff between getting the right information retrieved and cost. You can get ~99% on a single query, but you have to pay the input token cost every time you send that query. So for 100 pieces of information to be retrieved, if you needed 99% performance, you would likely need to send 100 requests. This is a good example of where context caching can significantly reduce the cost associated with using Gemini models while keeping the performance high.

FAQs
Do I lose model performance when I add more tokens to a query?
Generally, if you don't need tokens to be passed to the model, it is best to avoid passing them. However, if you have a large chunk of tokens with some information and want to ask questions about that information, the model is highly capable of extracting that information (up to 99% accuracy in many cases).

How does Gemini 1.5 Pro perform on the standard needle-in-a-haystack test?
Gemini 1.5 Pro achieves 100% recall up to 530k tokens and >99.7% recall up to 1M tokens.

How can I lower my cost with long-context queries?
If you have a similar set of tokens / context that you want to re-use many times, context caching can help reduce the costs associated with asking questions about that information.

How can I get access to the 2-million-token context window?
All developers now have access to the 2-million-token context window with Gemini 1.5 Pro.

Does the context length affect the model latency?
There is some fixed amount of latency in any given request, regardless of the size, but generally longer queries will have higher latency (time to first token).

Do the long context capabilities differ between Gemini 1.5 Flash and Gemini 1.5 Pro?
Yes, some of the numbers were mentioned in different sections of this guide, but generally Gemini 1.5 Pro is more performant on most long context use cases.

Context caching

Python 

In a typical AI workflow, you might pass the same input tokens over and over to a model. Using the Gemini API context caching feature, you can pass some content to the model once, cache the input tokens, and then refer to the cached tokens for subsequent requests. At certain volumes, using cached tokens is lower cost than passing in the same corpus of tokens repeatedly.

When you cache a set of tokens, you can choose how long you want the cache to exist before the tokens are automatically deleted. This caching duration is called the time to live (TTL). If not set, the TTL defaults to 1 hour. The cost for caching depends on the input token size and how long you want the tokens to persist.

Context caching supports both Gemini 1.5 Pro and Gemini 1.5 Flash.

Note: Context caching is only available for stable models with fixed versions (for example, gemini-1.5-pro-001). You must include the version postfix (for example, the -001 in gemini-1.5-pro-001).
When to use context caching
Context caching is particularly well suited to scenarios where a substantial initial context is referenced repeatedly by shorter requests. Consider using context caching for use cases such as:

Chatbots with extensive system instructions
Repetitive analysis of lengthy video files
Recurring queries against large document sets
Frequent code repository analysis or bug fixing
How caching reduces costs
Context caching is a paid feature designed to reduce overall operational costs. Billing is based on the following factors:

Cache token count: The number of input tokens cached, billed at a reduced rate when included in subsequent prompts.
Storage duration: The amount of time cached tokens are stored (TTL), billed based on the TTL duration of cached token count. There are no minimum or maximum bounds on the TTL.
Other factors: Other charges apply, such as for non-cached input tokens and output tokens.
For up-to-date pricing details, refer to the Gemini API pricing page. To learn how to count tokens, see the Token guide.

How to use context caching
This section assumes that you've installed a Gemini SDK (or have curl installed) and that you've configured an API key, as shown in the quickstart.

Generate content using a cache
The following example shows how to generate content using a cached system instruction and video file.


import os
import pathlib
import requests
import time

from google import genai
from google.genai import types

# Get your API key from https://aistudio.google.com/app/apikey
# Put it in a "GOOGLE_API_KEY" environment variable.
# For more details, see
# https://github.com/google-gemini/cookbook/blob/main/quickstarts/Authentication.ipynb
client = genai.Client()

# Download video file
url = 'https://storage.googleapis.com/generativeai-downloads/data/Sherlock_Jr_FullMovie.mp4'
path_to_video_file = pathlib.Path('Sherlock_Jr_FullMovie.mp4')
if not path_to_video_file.exists():
  with path_to_video_file.open('wb') as wf:
    response = requests.get(url, stream=True)
    for chunk in response.iter_content(chunk_size=32768):
      wf.write(chunk)

# Upload the video using the Files API
video_file = client.files.upload(file=path_to_video_file)

# Wait for the file to finish processing
while video_file.state.name == 'PROCESSING':
  print('Waiting for video to be processed.')
  time.sleep(2)
  video_file = client.files.get(name=video_file.name)

print(f'Video processing complete: {video_file.uri}')

# You must use an explicit version suffix. "-flash-001", not just "-flash".
model='models/gemini-1.5-flash-001'

# Create a cache with a 5 minute TTL
cache = client.caches.create(
    model=model,
    config=types.CreateCachedContentConfig(
      display_name='sherlock jr movie', # used to identify the cache
      system_instruction=(
          'You are an expert video analyzer, and your job is to answer '
          'the user\'s query based on the video file you have access to.'
      ),
      contents=[video_file],
      ttl="300s",
  )
)

# Construct a GenerativeModel which uses the created cache.
response = client.models.generate_content(
  model = model,
  contents= (
    'Introduce different characters in the movie by describing '
    'their personality, looks, and names. Also list the timestamps '
    'they were introduced for the first time.'),
  config=types.GenerateContentConfig(cached_content=cache.name)
)

print(response.usage_metadata)

# The output should look something like this:
#
# prompt_token_count: 696219
# cached_content_token_count: 696190
# candidates_token_count: 214
# total_token_count: 696433

print(response.text)
List caches
It's not possible to retrieve or view cached content, but you can retrieve cache metadata (name, model, display_name, usage_metadata, create_time, update_time, and expire_time).

To list metadata for all uploaded caches, use CachedContent.list():


for cache in client.caches.list():
  print(cache)
To fetch the metadata for one cache object, if you know its name, use get:


client.caches.get(name=name)
Update a cache
You can set a new ttl or expire_time for a cache. Changing anything else about the cache isn't supported.

The following example shows how to update the ttl of a cache using client.caches.update().


from google import genai
from google.genai import types

client.caches.update(
  name = cache.name,
  config  = types.UpdateCachedContentConfig(
      ttl='300s'
  )
)
To set the expiry time, it will accepts either a datetime object or an ISO-formatted datetime string (dt.isoformat(), like 2025-01-27T16:02:36.473528+00:00). Your time must include a time zone (datetime.utcnow() doesn't attach a time zone, datetime.now(datetime.timezone.utc) does attach a time zone).


from google import genai
from google.genai import types
import datetime

# You must use a time zone-aware time.
in10min = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=10)

client.caches.update(
  name = cache.name,
  config  = types.UpdateCachedContentConfig(
      expire_time=in10min
  )
)
Delete a cache
The caching service provides a delete operation for manually removing content from the cache. The following example shows how to delete a cache:

client.caches.delete(cache.name)
Additional considerations
Keep the following considerations in mind when using context caching:

The minimum input token count for context caching is 32,768, and the maximum is the same as the maximum for the given model. (For more on counting tokens, see the Token guide).
The model doesn't make any distinction between cached tokens and regular input tokens. Cached content is simply a prefix to the prompt.
There are no special rate or usage limits on context caching; the standard rate limits for GenerateContent apply, and token limits include cached tokens.
The number of cached tokens is returned in the usage_metadata from the create, get, and list operations of the cache service, and also in GenerateContent when using the cache.

The Gemini API code execution feature enables the model to generate and run Python code and learn iteratively from the results until it arrives at a final output. You can use this code execution capability to build applications that benefit from code-based reasoning and that produce text output. For example, you could use code execution in an application that solves equations or processes text.

Note: Gemini is only able to execute code in Python. You can still ask Gemini to generate code in another language, but the model can't use the code execution tool to run it.
Code execution is available in both AI Studio and the Gemini API. In AI Studio, you can enable code execution in the right panel under Tools. The Gemini API provides code execution as a tool, similar to function calling. After you add code execution as a tool, the model decides when to use it.

The code execution environment includes the following libraries: altair, chess, cv2, matplotlib, mpmath, numpy, pandas, pdfminer, reportlab, seaborn, sklearn, statsmodels, striprtf, sympy, and tabulate. You can't install your own libraries.

Note: Only matplotlib is supported for graph rendering using code execution.

Enable code execution on the model
You can enable code execution on the model, as shown here:


from google import genai
from google.genai import types

client = genai.Client(api_key="GEMINI_API_KEY")

response = client.models.generate_content(
  model='gemini-2.0-flash',
  contents='What is the sum of the first 50 prime numbers? '
           'Generate and run code for the calculation, and make sure you get all 50.',
  config=types.GenerateContentConfig(
    tools=[types.Tool(
      code_execution=types.ToolCodeExecution
    )]
  )
)
In a notebook you can display everything in Markdown format with this helper function:


def display_code_execution_result(response):
  for part in response.candidates[0].content.parts:
    if part.text is not None:
      display(Markdown(part.text))
    if part.executable_code is not None:
      code_html = f'<pre style="background-color: #BBBBEE;">{part.executable_code.code}</pre>' # Change code color
      display(HTML(code_html))
    if part.code_execution_result is not None:
      display(Markdown(part.code_execution_result.output))
    if part.inline_data is not None:
      display(Image(data=part.inline_data.data, format="png"))
    display(Markdown("---"))

display_code_execution_result(response)
The output might look something like this:

Okay, I need to calculate the sum of the first 50 prime numbers. I will use a python script to generate the first 50 primes and then sum them up.


```python
def is_prime(n):
  """Checks if a number is prime."""
  if n <= 1:
    return False
  for i in range(2, int(n**0.5) + 1):
    if n % i == 0:
      return False
  return True

def sum_of_primes(n):
  """Calculates the sum of the first n prime numbers."""
  primes = []
  i = 2
  while len(primes) < n:
    if is_prime(i):
      primes.append(i)
    i += 1
  return sum(primes)

# Calculate the sum of the first 50 prime numbers
sum_of_first_50_primes = sum_of_primes(50)

print(f"The sum of the first 50 prime numbers is: {sum_of_first_50_primes}")
```

**Output:**

```
The sum of the first 50 prime numbers is: 5117
```
Use code execution in chat
You can also use code execution as part of a chat.


from google import genai
from google.genai import types

client = genai.Client(api_key="GEMINI_API_KEY")

chat = client.chats.create(
    model='gemini-2.0-flash',
    config=types.GenerateContentConfig(
      tools=[types.Tool(
        code_execution=types.ToolCodeExecution
      )]
    )
)

response = chat.send_message("Can you run some code to bogo-sort this list of numbers?: [2,34,1,65,4]")
display_code_execution_result(response)
The conversation could continue like this:

I understand that you want me to bogo-sort the list [2, 34, 1, 65, 4]. Bogo-sort is a notoriously inefficient sorting algorithm. It works by repeatedly shuffling the list until it happens to be sorted. Due to its extremely poor performance, it's impractical for lists of any significant size.

However, for demonstration purposes, I can run a simplified version for a very limited number of iterations, just to show the process. Should I go ahead?


response = chat.send_message("Yes, please create the code.")
display_code_execution_result(response)
Okay,I will proceed with a function that shuffles the list and checks if it's sorted. I'll run it for a maximum of 10 iterations. ...

Input/output (I/O)
Starting with Gemini 2.0 Flash, code execution supports file input and graph output. Using these new input and output capabilities, you can upload CSV and text files, ask questions about the files, and have Matplotlib graphs generated as part of the response.

I/O pricing
When using code execution I/O, you're charged for input tokens and output tokens:

Input tokens:

User prompt
Output tokens:

Code generated by the model
Code execution output in the code environment
Summary generated by the model
I/O details
When you're working with code execution I/O, be aware of the following technical details:

The maximum runtime of the code environment is 30 seconds.
If the code environment generates an error, the model may decide to regenerate the code output. This can happen up to 5 times.
The maximum file input size is limited by the model token window. In AI Studio, using Gemini Flash 2.0, the maximum input file size is 1 million tokens (roughly 2MB for text files of the supported input types). If you upload a file that's too large, AI Studio won't let you send it.
Single turn	Bidirectional (Multimodal Live API)
Models supported	All Gemini 2.0 models	Only Flash experimental models
File input types supported	.png, .jpeg, .csv, .xml, .cpp, .java, .py, .js, .ts	.png, .jpeg, .csv, .xml, .cpp, .java, .py, .js, .ts
Plotting libraries supported	Matplotlib	Matplotlib
Multi-tool use	No	Yes

Use Gemini thinking

Gemini 2.5 Pro Experimental and Gemini 2.0 Flash Thinking Experimental are models that use an internal "thinking process" during response generation. This process contributes to their improved reasoning capabilities and allows them to solve complex tasks. This guide shows you how to use Gemini models with thinking capabilities.

Try Gemini 2.5 Pro Preview in Google AI Studio
Note: 'gemini-2.5-pro-preview-03-25' is a billed model, you can continue to use 'gemini-2.5-pro-exp-03-25' on the free tier.
Before you begin
Before calling the Gemini API, ensure you have your SDK of choice installed, and a Gemini API key configured and ready to use.

Use thinking models
Models with thinking capabilities are available in Google AI Studio and through the Gemini API. Note that the thinking process is visible within Google AI Studio but is not provided as part of the API output.

Send a basic request
Python
JavaScript
Go
REST

from google import genai

client = genai.Client(api_key="GEMINI_API_KEY")
prompt = "Explain the concept of Occam's Razor and provide a simple, everyday example."
response = client.models.generate_content(
    model="gemini-2.5-pro-exp-03-25",  # or gemini-2.0-flash-thinking-exp
    contents=prompt
)

print(response.text)
Multi-turn thinking conversations
To take the previous chat history into account, you can use multi-turn conversations.

With the SDKs, you can create a chat session to manage the state of the conversation.

Python
JavaScript

from google import genai

client = genai.Client(api_key='GEMINI_API_KEY')

chat = client.aio.chats.create(
    model='gemini-2.5-pro-preview-03-25',  # or gemini-2.0-flash-thinking-exp
)
response = await chat.send_message('What is your name?')
print(response.text)
response = await chat.send_message('What did you just say before this?')
print(response.text)
Use tools with thinking models
Thinking models can use tools to perform actions beyond generating text. This allows them to interact with external systems, execute code, or access real-time information, incorporating the results into their reasoning and final response.

Search Tool
The Search tool allows the model to query external search engines to find up-to-date information or information beyond its training data. This is useful for questions about recent events or highly specific topics.

To configure the search tool, see Configure the Search tool.

Prompt:

What were the major scientific breakthroughs announced last week?
Response (using Search Tool):

Based on recent search results, here are some highlights from the past week in science:

...
(gemini-2.5-pro-exp-03-25)
Code Execution
The Code execution tool enables the model to generate and run Python code to perform calculations, manipulate data, or solve problems that are best handled algorithmically. The model receives the code's output and can use it in its response.

To configure code execution, see Enable code execution on the model.

Prompt:

What is the sum of the first 50 prime numbers?
Generate and run Python code for the calculation, and make sure you get all 50.
Provide the final sum clearly.
Response (using Code Execution Tool):

Okay, I can calculate that. I will generate Python code to find the first 50 prime numbers and sum them up.

```python
def is_prime(num):
    if num < 2:
        return False
    for i in range(2, int(num**0.5) + 1):
        if num % i == 0:
            return False
    return True

primes = []
num = 2
while len(primes) < 50:
    if is_prime(num):
        primes.append(num)
    num += 1

total_sum = sum(primes)
print(total_sum)
```

Running the code...

Code Execution Result:
Outcome: OK
Output:

5117
Use code with caution.
The sum of the first 50 prime numbers is 5117.
(gemini-2.5-pro-exp-03-25)
Structured Output
With structured output, you can constrain Gemini to respond with JSON, a structured output format suitable for automated processing. This is particularly useful for integrating the model's output into applications.

You can specify the format directly in the prompt or supply a schema through model configuration.

Prompt:

Provide a list of 3 famous physicists and their key contributions
in JSON format.
Use this JSON schema:

Physicist = {'name': str, 'contribution': str, 'era': str}
Return: list[Physicist]
Response (instructed for JSON):

```json
[
{
"name": "Albert Einstein",
"contribution": "Theory of Relativity (Special and General)",
"era": "Early 20th Century"
},
{
"name": "Isaac Newton",
"contribution": "Laws of Motion and Universal Gravitation",
"era": "Late 17th / Early 18th Century"
},
{
"name": "Marie Curie",
"contribution": "Pioneering research on radioactivity",
"era": "Late 19th / Early 20th Century"
}
]
```
(gemini-2.5-pro-preview-03-25)
Prompting techniques for thinking models
Effective prompting is crucial for maximizing the benefits of the Gemini thinking models. This section outlines some prompting practices for thinking models.

Getting started
Begin with general instructions that describe the desired outcome. Start with a simple prompt and observe the model's initial thoughts on how to tackle the challenge.

Prompt:

Describe the most unusual or striking architectural feature you've ever seen in a building or structure.
Response:

<...>
The most unusual architectural feature that has truly stayed with me is the "floating roof" of the
Heydar Aliyev Center in Baku, Azerbaijan, designed by Zaha Hadid Architects.

Visually, it's breathtaking. Imagine a vast, undulating landscape of pure white, seemingly draped
over the building. It's not just a roof in the traditional sense; it's an extension of the ground,
flowing seamlessly upwards and over the building's various spaces before curving back down to meet
the earth again. There are no sharp angles, no rigid lines. Instead, everything is fluid, organic,
and continuous. It resembles a giant, pristine white wave frozen in motion, or perhaps a sand dune
sculpted by an unseen wind.
<...>
(gemini-2.5-pro-exp-03-25)
Provide Step-by-Step Instructions
If the initial attempt does not yield the desired result, refine your prompt by providing more explicit step-by-step instructions to guide Gemini through the problem-solving process for a more focused approach. This allows you steer the model's initial understanding of the task with explicit suggestions and guidance.

Prompt:

Now imagine that architectural feature is not just for looks, but has a specific function or
purpose related to the building's environment or the people who use it. Explain what that
function could be and how it enhances the building's overall design and usability.
Response:

<...>
Let's imagine that the "floating roof" of the Heydar Aliyev Center is not purely aesthetic but
serves a crucial environmental and user-centric function: it's designed as a sophisticated climate
moderator and natural ventilation system for the Baku environment.

Here's how this function would work and enhance the building:

Function: Passive Climate Control and Natural Ventilation System

Shading and Solar Heat Mitigation: The undulating curves of the white GFRC roof are strategically
shaped and oriented to provide optimal shading throughout the day, year-round. Baku experiences
intense sun, especially during the summer. The overhanging curves, acting like giant brise-soleils,
would block direct sunlight from hitting the building's glass facade, significantly reducing solar
heat gain. The varying heights and depths of the curves would create dynamic shade patterns, ensuring
that different parts of the building are shaded at different times of the day, optimizing comfort
and reducing the need for excessive air conditioning. The white color of the GFRC further enhances
this by reflecting a large portion of the solar radiation.
<...>
(gemini-2.5-pro-exp-03-25)
Multishot Prompting with Thinking
Multishot prompting in conjunction with thinking can further enhance Gemini's understanding and improve the accuracy of its responses. Provide several examples of input-output pairs, demonstrating the desired behavior and output format in your prompt.

Prompt:

Example 1:
User: What is the tallest mountain in the world?
Assistant: Mount Everest

Example 2:
User: What is the largest ocean?
Assistant: Pacific Ocean

User: What is the longest river in the world?
Assistant:
Response:

Amazon River
(gemini-2.5-pro-exp-03-25)
Defining Output and Behavior
When building an application where users will interact directly with the model, you may want to provide guidance for how Gemini's output and responses will sound and be formatted.

System Instructions
System instructions are a set of instructions that the model processes before it processes prompts. They are recalled each time the model is prompted and tell the model how you want it to behave and respond. For example, you can include things like the role or persona, contextual information, and formatting instructions.

Prompt:

System Instruction: You are a helpful and concise coding tutor. Always provide code examples and explain them briefly.

User Prompt: Explain what is a closure in Javascript and give an example.
Response:

function outerFunction(outerVar) {
function innerFunction(innerVar) {
console.log(outerVar); // Accessing outerVar from outerFunction's scope
console.log(innerVar);
}
return innerFunction;
}

const closureExample = outerFunction('I am from outer');
closureExample('I am from inner');

Explanation:

A closure is created when a function (innerFunction in this example) is defined inside another function
(outerFunction) and the inner function remembers and has access to the variables from the outer
function's scope, even after the outer function has finished executing.

In the example:

outerFunction is called with 'I am from outer' and returns innerFunction.

closureExample now holds a reference to innerFunction.

When closureExample('I am from inner') is called, innerFunction executes.

Even though outerFunction has already finished, innerFunction can still access and use outerVar
(which is 'I am from outer') because of the closure.

In essence, the innerFunction "closes over" the variables of its outer function's scope, creating
a closure.
(gemini-2.5-pro-exp-03-25)
Verification and Reflection
Include specific verification steps in either the System Instructions or your prompts directly. For example, ask Gemini to verify its sources, review its reasoning, identify potential errors, and check its final answer.

Prompt:

Verify the following statement and provide your sources: The capital of Brazil is Rio de Janeiro.
Response:

The statement "The capital of Brazil is Rio de Janeiro" is incorrect.

The current capital of Brazil is Brasília.

Rio de Janeiro was the capital of Brazil for a significant period, from 1763 to 1960. However, the
capital was moved to Brasília in 1960 as part of a plan to develop the country's interior and create
a more centrally located capital.

Verification and Sources:

You can easily verify this information from numerous reliable sources:

Encyclopedias:

Britannica: Searching for "Brazil" on Britannica will clearly state Brasília as the capital.

https://www.britannica.com/place/Brazil (Look for the "Capital" information in the introductory summary or "Geography" section)

Wikipedia: The Wikipedia article for "Brazil" also states Brasília as the capital.

https://en.wikipedia.org/wiki/Brazil (Look in the infobox or introductory section)

Government and Official Sources:

CIA World Factbook: This is a highly reliable source for country information. Searching for "Brazil"
will list Brasília as the capital.

https://www.cia.gov/the-world-factbook/countries/brazil/ (Look under "Government" > "Capital")

Official Website of the Brazilian Government (if accessible and in English): While navigating official
government websites can sometimes be complex, they would definitively list Brasília as the capital.

Geographic Resources:

National Geographic: Their website and publications will confirm Brasília as the capital of Brazil.

Atlases and Geography Textbooks: Any modern atlas or geography textbook will list Brasília as the capital.

Why the confusion?

The confusion might arise because:

Rio de Janeiro is a very famous Brazilian city: It's a major tourist destination, known for its
beaches, Carnival, and iconic landmarks like Christ the Redeemer. Its past status as capital adds
to its historical significance and public recognition.

Historical context: Rio de Janeiro was the capital for a long time. People who learned about Brazil
in the past might remember it as the capital.

In conclusion, the statement is false. The capital of Brazil is Brasília, not Rio de Janeiro. Rio
de Janeiro was the former capital but is no longer the current capital.

You can confidently use the sources listed above to verify this information.
(gemini-2.5-pro-exp-03-25)
Debugging and Steering
Google AI Studio provides developers access to the model's thoughts in the UI. This is helpful as a developer reviewing your prompt when debugging:

Analyze the Thought Process
Carefully review Gemini's thought process to identify any areas where it may have gone astray. This analysis can provide valuable clues for refining your prompts and getting your expected response consistently in your application.

Example Scenario: If Gemini's thought process shows it misunderstood a step in a complex instruction, you can refine the prompt to clarify that specific step.

Prompt:

Step 1: Summarize the following article about quantum physics.
Step 2: Translate the summary into Spanish.
Step 3: Extract the key entities from the Spanish summary.

Article: ... [Article Text] ...
Gemini's Thought Process Analysis (Example):

The user wants me to process an article about Google's new quantum chip called Willow in three steps:
Step 1: Summarize the article.
Step 2: Translate the summary into Spanish.
Step 3: Extract the key entities from the Spanish summary.

Let's break down each step.

Step 1: Summarize the article.
I need to read the article and identify the main points. The article is about Google's new quantum
chip, Willow, and its achievements. The key achievements are:

Exponential error reduction as qubits scale up.

Outperforming supercomputers in a benchmark computation (RCS).

Willow is a step towards commercially relevant quantum computing.

It's the first system below threshold for quantum error correction.

It achieved a benchmark computation in under 5 minutes that would take a supercomputer 10 septillion years.

It was fabricated in a new facility.

It has state-of-the-art performance and high quality qubits.

Google is looking towards real-world applications with Willow.

Quantum computing will benefit AI.

I will synthesize these points into a concise summary.

Step 2: Translate the summary into Spanish.
Once I have the summary in English, I will translate it into Spanish. I need to ensure the translation
is accurate and natural-sounding in Spanish.

Step 3: Extract the key entities from the Spanish summary.
After translating the summary, I will identify and extract the key entities. Key entities are typically
nouns or noun phrases that represent important objects, concepts, or actors. In this context, they
will likely include:

Names of chips (Willow, Sycamore)

Companies/Organizations (Google Quantum AI, Google Research)

Technologies (quantum chip, quantum computer, qubits, quantum error correction, superconducting
quantum system, classical computers, supercomputers, AI)

Benchmarks (random circuit sampling, RCS)

People (Julian Kelly, Peter Shor, David Deutsch, Sergio Boixo, Hartmut Neven, John Preskill)

Concepts (exponential error reduction, below threshold, beyond breakeven, state-of-the-art performance,
commercially relevant applications, quantum mechanics, multiverse, T1 times, system benchmarks,
algorithmic benchmarks)

I will need to carefully review the Spanish summary to identify these entities and list them out.

Provide Corrective Feedback
If you observe errors or inconsistencies in Gemini's reasoning, provide corrective feedback in your prompt and/or System Instructions to anticipate where the model's response may deviate from your desired outcome.

Prompt:

You are an expert in botany. When asked to identify a plant, focus on leaf shape, flower structure, and stem characteristics.

Identify this plant based on these characteristics: ... [Plant Characteristics Description] ...

Previous incorrect response focused on habitat only. Please disregard habitat and focus on morphology.
Refined Prompt (if needed based on thought process):

Previous incorrect response focused on habitat only. Please disregard habitat and focus on morphology.
Response:

Tabebuia vellosoi
(gemini-2.5-pro-exp-03-25)
Making the Best of Long Outputs and Longform Thinking
Thinking generates “thoughts” as part of the Token Output that showcases Gemini's detailed reasoning. To make the most of these outputs:

Review the Reasoning
Pay close attention to Gemini's reasoning process (available in the Google AI Studio UI), how it broke down the task and the choices it made for your output. This can help you understand how it arrived at its conclusion.

Provide Guidance in Reasoning
If your desired output is to be particularly lengthy, you may want to provide more guidance in your prompt to constrain the amount of thinking needed to accomplish the task presented in the prompt. This allows you to reserve more of the Token Output for your response.

Example: For a detailed report, you might specify sections and sub-sections in your prompt to guide Gemini's thinking and structure the output efficiently.

Prompt:

Generate a detailed report on the impact of climate change on coastal ecosystems.

Report Structure:

Introduction

Rising Sea Levels
2.1. Impact on Mangroves
2.2. Impact on Coral Reefs

Ocean Acidification
3.1. Impact on Shellfish
3.2. Impact on Plankton

Extreme Weather Events
4.1. Increased Storm Intensity
4.2. Coastal Erosion

Conclusion

Provide detailed analysis within each section.
Response:

<...>
Climate Change Impact on Coastal Ecosystems: A Detailed Report

1. Introduction

Coastal ecosystems, the dynamic interface between land and sea, are among the most productive and
biodiverse environments on Earth. They provide crucial ecosystem services, including coastal protection,
fisheries, carbon sequestration, and support for a vast array of species. However, these vital
ecosystems are increasingly threatened by the multifaceted impacts of climate change. Driven by
anthropogenic greenhouse gas emissions, climate change is manifesting in several interconnected ways
that are profoundly altering the physical and chemical conditions of coastal environments. This report
will delve into the key impacts of climate change on coastal ecosystems, focusing on rising sea levels,
ocean acidification, and extreme weather events, and their specific consequences for critical habitats
like mangroves and coral reefs, and key organisms like shellfish and plankton. Understanding these
impacts is crucial for developing effective conservation and management strategies to mitigate the
damage and enhance the resilience of these invaluable ecosystems.

2. Rising Sea Levels

Rising sea levels are a direct and significant consequence of global warming, driven by thermal
expansion of seawater and the melting of land ice (glaciers and ice sheets). This phenomenon poses a
direct threat to low-lying coastal ecosystems by inundating habitats, altering salinity regimes, and
increasing erosion rates. The rate of sea level rise is accelerating, and projections for the 21st
century indicate a continued upward trend, with potentially devastating consequences for coastal
environments.

2.1. Impact on Mangroves

Mangrove forests are unique coastal ecosystems found in tropical and subtropical intertidal zones.
They provide numerous benefits, including coastal protection against storms, nursery grounds for
fish and invertebrates, and significant carbon sequestration...
<...>

Function Calling with the Gemini API

Function calling lets you connect models to external tools and APIs. Instead of generating text responses, the model understands when to call specific functions and provides the necessary parameters to execute real-world actions. This allows the model to act as a bridge between natural language and real-world actions and data. Function calling has 3 primary use cases:

Augment Knowledge: Access information from external sources like databases, APIs, and knowledge bases.
Extend Capabilities: Use external tools to perform computations and extend the limitations of the model, such as using a calculator or creating charts.
Take Actions: Interact with external systems using APIs, such as scheduling appointments, creating invoices, sending emails, or controlling smart home devices
Get Weather Schedule Meeting Create Chart

Python
JavaScript
REST

 from google import genai
 from google.genai import types

 # Define the function declaration for the model
 schedule_meeting_function = {
     "name": "schedule_meeting",
     "description": "Schedules a meeting with specified attendees at a given time and date.",
     "parameters": {
         "type": "object",
         "properties": {
             "attendees": {
                 "type": "array",
                 "items": {"type": "string"},
                 "description": "List of people attending the meeting.",
             },
             "date": {
                 "type": "string",
                 "description": "Date of the meeting (e.g., '2024-07-29')",
             },
             "time": {
                 "type": "string",
                 "description": "Time of the meeting (e.g., '15:00')",
             },
             "topic": {
                 "type": "string",
                 "description": "The subject or topic of the meeting.",
             },
         },
         "required": ["attendees", "date", "time", "topic"],
     },
 }

 # Configure the client and tools
 client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
 tools = types.Tool(function_declarations=[schedule_meeting_function])
 config = types.GenerateContentConfig(tools=[tools])

 # Send request with function declarations
 response = client.models.generate_content(
     model="gemini-2.0-flash",
     contents="Schedule a meeting with Bob and Alice for 03/14/2025 at 10:00 AM about the Q3 planning.",
     config=config,
 )

 # Check for a function call
 if response.candidates[0].content.parts[0].function_call:
     function_call = response.candidates[0].content.parts[0].function_call
     print(f"Function to call: {function_call.name}")
     print(f"Arguments: {function_call.args}")
     #  In a real app, you would call your function here:
     #  result = schedule_meeting(**function_call.args)
 else:
     print("No function call found in the response.")
     print(response.text)
How Function Calling Works
function calling overview

Function calling involves a structured interaction between your application, the model, and external functions. Here's a breakdown of the process:

Define Function Declaration: Define the function declaration in your application code. Function Declarations describe the function's name, parameters, and purpose to the model.
Call LLM with function declarations: Send user prompt along with the function declaration(s) to the model. It analyzes the request and determines if a function call would be helpful. If so, it responds with a structured JSON object.
Execute Function Code (Your Responsibility): The Model does not execute the function itself. It's your application's responsibility to process the response and check for Function Call, if
Yes: Extract the name and args of the function and execute the corresponding function in your application.
No: The model has provided a direct text response to the prompt (this flow is less emphasized in the example but is a possible outcome).
Create User friendly response: If a function was executed, capture the result and send it back to the model in a subsequent turn of the conversation. It will use the result to generate a final, user-friendly response that incorporates the information from the function call.
This process can be repeated over multiple turns, allowing for complex interactions and workflows. The model also supports calling multiple functions in a single turn (parallel function calling) and in sequence (compositional function calling).

Step 1: Define Function Declaration
Define a function and its declaration within your application code that allows users to set light values and make an API request. This function could call external services or APIs.

Python
JavaScript

from google.genai import types

# Define a function that the model can call to control smart lights
set_light_values_declaration = {
    "name": "set_light_values",
    "description": "Sets the brightness and color temperature of a light.",
    "parameters": {
        "type": "object",
        "properties": {
            "brightness": {
                "type": "integer",
                "description": "Light level from 0 to 100. Zero is off and 100 is full brightness",
            },
            "color_temp": {
                "type": "string",
                "enum": ["daylight", "cool", "warm"],
                "description": "Color temperature of the light fixture, which can be `daylight`, `cool` or `warm`.",
            },
        },
        "required": ["brightness", "color_temp"],
    },
}

# This is the actual function that would be called based on the model's suggestion
def set_light_values(brightness: int, color_temp: str) -> dict[str, int | str]:
    """Set the brightness and color temperature of a room light. (mock API).

    Args:
        brightness: Light level from 0 to 100. Zero is off and 100 is full brightness
        color_temp: Color temperature of the light fixture, which can be `daylight`, `cool` or `warm`.

    Returns:
        A dictionary containing the set brightness and color temperature.
    """
    return {"brightness": brightness, "colorTemperature": color_temp}

Step 2: Call the model with function declarations
Once you have defined your function declarations, you can prompt the model to use the function. It analyzes the prompt and function declarations and decides to respond directly or to call a function. If a function is called the response object will contain a function call suggestion.

Python
JavaScript

from google import genai

# Generation Config with Function Declaration
tools = types.Tool(function_declarations=[set_light_values_declaration])
config = types.GenerateContentConfig(tools=[tools])

# Configure the client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Define user prompt
contents = [
    types.Content(
        role="user", parts=[types.Part(text="Turn the lights down to a romantic level")]
    )
]

# Send request with function declarations
response = client.models.generate_content(
    model="gemini-2.0-flash", config=config, contents=contents
)

print(response.candidates[0].content.parts[0].function_call)
The model then returns a functionCall object in an OpenAPI compatible schema specifying how to call one or more of the declared functions in order to respond to the user's question.

Python
JavaScript

id=None args={'color_temp': 'warm', 'brightness': 25} name='set_light_values'
Step 3: Execute set_light_values function code
Extract the function call details from the model's response, parse the arguments , and execute the set_light_values function in our code.

Python
JavaScript

# Extract tool call details
tool_call = response.candidates[0].content.parts[0].function_call

if tool_call.name == "set_light_values":
    result = set_light_values(**tool_call.args)
    print(f"Function execution result: {result}")
Step 4: Create User friendly response with function result and call the model again
Finally, send the result of the function execution back to the model so it can incorporate this information into its final response to the user.

Python
JavaScript

# Create a function response part
function_response_part = types.Part.from_function_response(
    name=tool_call.name,
    response={"result": result},
)

# Append function call and result of the function execution to contents
contents.append(types.Content(role="model", parts=[types.Part(function_call=tool_call)])) # Append the model's function call message
contents.append(types.Content(role="user", parts=[function_response_part])) # Append the function response

final_response = client.models.generate_content(
    model="gemini-2.0-flash",
    config=config,
    contents=contents,
)

print(final_response.text)
This completes the function calling flow. The Model successfully used the set_light_values function to perform the request action of the user.

Function declarations
When you implement function calling in a prompt, you create a tools object, which contains one or more function declarations. You define functions using JSON, specifically with a select subset of the OpenAPI schema format. A single function declaration can include the following parameters:

name (string): A unique name for the function (get_weather_forecast, send_email). Use descriptive names without spaces or special characters (use underscores or camelCase).
description (string): A clear and detailed explanation of the function's purpose and capabilities. This is crucial for the model to understand when to use the function. Be specific and provide examples if helpful ("Finds theaters based on location and optionally movie title which is currently playing in theaters.").
parameters (object): Defines the input parameters the function expects.
type (string): Specifies the overall data type, such as object.
properties (object): Lists individual parameters, each with:
type (string): The data type of the parameter, such as string, integer, boolean, array.
description (string): A description of the parameter's purpose and format. Provide examples and constraints ("The city and state, e.g., 'San Francisco, CA' or a zip code e.g., '95616'.").
enum (array, optional): If the parameter values are from a fixed set, use "enum" to list the allowed values instead of just describing them in the description. This improves accuracy ("enum": ["daylight", "cool", "warm"]).
required (array): An array of strings listing the parameter names that are mandatory for the function to operate.
Parallel Function Calling
In addition to single turn function calling, you can also call multiple functions at once. Parallel function calling lets you execute multiple functions at once and is used when the functions are not dependent on each other. This is useful in scenarios like gathering data from multiple independent sources, such as retrieving customer details from different databases or checking inventory levels across various warehouses or performing multiple actions such as converting your apartment into a disco.

Python
JavaScript

power_disco_ball = {
    "name": "power_disco_ball",
    "description": "Powers the spinning disco ball.",
    "parameters": {
        "type": "object",
        "properties": {
            "power": {
                "type": "boolean",
                "description": "Whether to turn the disco ball on or off.",
            }
        },
        "required": ["power"],
    },
}

start_music = {
    "name": "start_music",
    "description": "Play some music matching the specified parameters.",
    "parameters": {
        "type": "object",
        "properties": {
            "energetic": {
                "type": "boolean",
                "description": "Whether the music is energetic or not.",
            },
            "loud": {
                "type": "boolean",
                "description": "Whether the music is loud or not.",
            },
        },
        "required": ["energetic", "loud"],
    },
}

dim_lights = {
    "name": "dim_lights",
    "description": "Dim the lights.",
    "parameters": {
        "type": "object",
        "properties": {
            "brightness": {
                "type": "number",
                "description": "The brightness of the lights, 0.0 is off, 1.0 is full.",
            }
        },
        "required": ["brightness"],
    },
}
Call the model with an instruction that could use all of the specified tools. This example uses a tool_config. To learn more you can read about configuring function calling.

Python
JavaScript

from google import genai
from google.genai import types

# Set up function declarations
house_tools = [
    types.Tool(function_declarations=[power_disco_ball, start_music, dim_lights])
]

config = {
    "tools": house_tools,
    "automatic_function_calling": {"disable": True},
    # Force the model to call 'any' function, instead of chatting.
    "tool_config": {"function_calling_config": {"mode": "any"}},
}

# Configure the client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

chat = client.chats.create(model="gemini-2.0-flash", config=config)
response = chat.send_message("Turn this place into a party!")

# Print out each of the function calls requested from this single call
print("Example 1: Forced function calling")
for fn in response.function_calls:
    args = ", ".join(f"{key}={val}" for key, val in fn.args.items())
    print(f"{fn.name}({args})")
Each of the printed results reflects a single function call that the model has requested. To send the results back, include the responses in the same order as they were requested.

The Python SDK supports a feature called automatic function calling which converts the Python function to declarations, handles the function call execution and response cycle for you. Following is an example for our disco use case.

Note: Automatic Function Calling is a Python SDK only feature at the moment.
Python

from google import genai
from google.genai import types

# Actual implementation functions
def power_disco_ball_impl(power: bool) -> dict:
    """Powers the spinning disco ball.

    Args:
        power: Whether to turn the disco ball on or off.

    Returns:
        A status dictionary indicating the current state.
    """
    return {"status": f"Disco ball powered {'on' if power else 'off'}"}

def start_music_impl(energetic: bool, loud: bool) -> dict:
    """Play some music matching the specified parameters.

    Args:
        energetic: Whether the music is energetic or not.
        loud: Whether the music is loud or not.

    Returns:
        A dictionary containing the music settings.
    """
    music_type = "energetic" if energetic else "chill"
    volume = "loud" if loud else "quiet"
    return {"music_type": music_type, "volume": volume}

def dim_lights_impl(brightness: float) -> dict:
    """Dim the lights.

    Args:
        brightness: The brightness of the lights, 0.0 is off, 1.0 is full.

    Returns:
        A dictionary containing the new brightness setting.
    """
    return {"brightness": brightness}

config = {
    "tools": [power_disco_ball_impl, start_music_impl, dim_lights_impl],
}

chat = client.chats.create(model="gemini-2.0-flash", config=config)
response = chat.send_message("Do everything you need to this place into party!")

print("\nExample 2: Automatic function calling")
print(response.text)
# I've turned on the disco ball, started playing loud and energetic music, and dimmed the lights to 50% brightness. Let's get this party started!
Compositional Function Calling
Gemini 2.0 supports compositional function calling, meaning the model can chain multiple function calls together. For example, to answer "Get the temperature in my current location", the Gemini API might invoke both a get_current_location() function and a get_weather() function that takes the location as a parameter.

Note: Compositional function calling is a Live API only feature at the moment. The run() function declaration, which handles the asynchronous websocket setup, is omitted for brevity.
Python
JavaScript

# Light control schemas
turn_on_the_lights_schema = {'name': 'turn_on_the_lights'}
turn_off_the_lights_schema = {'name': 'turn_off_the_lights'}

prompt = """
  Hey, can you write run some python code to turn on the lights, wait 10s and then turn off the lights?
  """

tools = [
    {'code_execution': {}},
    {'function_declarations': [turn_on_the_lights_schema, turn_off_the_lights_schema]}
]

await run(prompt, tools=tools, modality="AUDIO")
Function calling modes
The Gemini API lets you control how the model uses the provided tools (function declarations). Specifically, you can set the mode within the function_calling_config.

AUTO (Default): The model decides whether to generate a natural language response or suggest a function call based on the prompt and context. This is the most flexible mode and recommended for most scenarios.
ANY: The model is constrained to always predict a function call and guarantee function schema adherence. If allowed_function_names is not specified, the model can choose from any of the provided function declarations. If allowed_function_names is provided as a list, the model can only choose from the functions in that list. Use this mode when you require a function call in response to every prompt (if applicable).
NONE: The model is prohibited from making function calls. This is equivalent to sending a request without any function declarations. Use this to temporarily disable function calling without removing your tool definitions.

Python
JavaScript

from google.genai import types

# Configure function calling mode
tool_config = types.ToolConfig(
    function_calling_config=types.FunctionCallingConfig(
        mode="ANY", allowed_function_names=["get_current_temperature"]
    )
)

# Create the generation config
config = types.GenerateContentConfig(
    temperature=0,
    tools=[tools],  # not defined here.
    tool_config=tool_config,
)
Automatic Function Calling (Python Only)
When using the Python SDK, you can provide Python functions directly as tools. The SDK automatically converts the Python function to declarations, handles the function call execution and response cycle for you. The Python SDK then automatically:

Detects function call responses from the model.
Call the corresponding Python function in your code.
Sends the function response back to the model.
Returns the model's final text response.
To use this, define your function with type hints and a docstring, and then pass the function itself (not a JSON declaration) as a tool:

Python

from google import genai
from google.genai import types

# Define the function with type hints and docstring
def get_current_temperature(location: str) -> dict:
    """Gets the current temperature for a given location.

    Args:
        location: The city and state, e.g. San Francisco, CA

    Returns:
        A dictionary containing the temperature and unit.
    """
    # ... (implementation) ...
    return {"temperature": 25, "unit": "Celsius"}

# Configure the client and model
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))  # Replace with your actual API key setup
config = types.GenerateContentConfig(
    tools=[get_current_temperature]
)  # Pass the function itself

# Make the request
response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents="What's the temperature in London?",
    config=config,
)

print(response.text)  # The SDK handles the function call and returns the final text
You can disable automatic function calling with:

Python

# To disable automatic function calling:
config = types.GenerateContentConfig(
    tools=[get_current_temperature],
    automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True)
)
Automatic Function schema declaration
Automatic schema extraction from Python functions doesn't work in all cases. For example: it doesn't handle cases where you describe the fields of a nested dictionary-object. The API is able to describe any of the following types:

Python

AllowedType = (int | float | bool | str | list['AllowedType'] | dict[str, AllowedType])
To see what the inferred schema looks like, you can convert it using from_callable:

Python

def multiply(a: float, b: float):
    """Returns a * b."""
    return a * b

fn_decl = types.FunctionDeclaration.from_callable(callable=multiply, client=client)

# to_json_dict() provides a clean JSON representation.
print(fn_decl.to_json_dict())
Multi-tool use: Combine Native Tools with Function Calling
With Gemini 2.0, you can enable multiple tools combining native tools with function calling at the same time. Here's an example that enables two tools, Grounding with Google Search and code execution, in a request using the Live API.

Note: Multi-tool use is a Live API only feature at the moment. The run() function declaration, which handles the asynchronous websocket setup, is omitted for brevity.
Python
JavaScript


# Multiple tasks example - combining lights, code execution, and search
prompt = """
  Hey, I need you to do three things for me.

    1.  Turn on the lights.
    2.  Then compute the largest prime palindrome under 100000.
    3.  Then use Google Search to look up information about the largest earthquake in California the week of Dec 5 2024.

  Thanks!
  """

tools = [
    {'google_search': {}},
    {'code_execution': {}},
    {'function_declarations': [turn_on_the_lights_schema, turn_off_the_lights_schema]} # not defined here.
]

# Execute the prompt with specified tools in audio modality
await run(prompt, tools=tools, modality="AUDIO")
Python developers can try this out in the Live API Tool Use notebook.

Use Model Context Protocol (MCP)
Model Context Protocol (MCP) is an open standard to connect AI applications with external tools, data sources, and systems. MCP provides a common protocol for models to access context, such as functions (tools), data sources (resources), or predefined prompts. You can use models with MCP server using their tool calling capabilities.

MCP servers expose the tools as JSON schema definitions, which can be used with Gemini compatible function declarations. This lets you to use a MCP server with Gemini models directly. Here, you can find an example of how to use a local MCP server with Gemini SDK and the mcp SDK.

Python
JavaScript

import asyncio
import os
from datetime import datetime
from google import genai
from google.genai import types
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Create server parameters for stdio connection
server_params = StdioServerParameters(
    command="npx",  # Executable
    args=["-y", "@philschmid/weather-mcp"],  # Weather MCP Server
    env=None,  # Optional environment variables
)

async def run():
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            # Prompt to get the weather for the current day in London.
            prompt = f"What is the weather in London in {datetime.now().strftime('%Y-%m-%d')}?"
            # Initialize the connection between client and server
            await session.initialize()

            # Get tools from MCP session and convert to Gemini Tool objects
            mcp_tools = await session.list_tools()
            tools = [
                types.Tool(
                    function_declarations=[
                        {
                            "name": tool.name,
                            "description": tool.description,
                            "parameters": {
                                k: v
                                for k, v in tool.inputSchema.items()
                                if k not in ["additionalProperties", "$schema"]
                            },
                        }
                    ]
                )
                for tool in mcp_tools.tools
            ]

            # Send request to the model with MCP function declarations
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0,
                    tools=tools,
                ),
            )

            # Check for a function call
            if response.candidates[0].content.parts[0].function_call:
                function_call = response.candidates[0].content.parts[0].function_call
                print(function_call)
                # Call the MCP server with the predicted tool
                result = await session.call_tool(
                    function_call.name, arguments=function_call.args
                )
                print(result.content[0].text)
                # Continue as shown in step 4 of "How Function Calling Works"
                # and create a user friendly response
            else:
                print("No function call found in the response.")
                print(response.text)

# Start the asyncio event loop and run the main function
asyncio.run(run())
Supported Models
Experimental models are not included. You can find their capabilities on the model overview page.

Model	Function Calling	Parallel Function Calling	Compositional Function Calling
(Live API only)
Gemini 2.0 Flash	✔️	✔️	✔️
Gemini 2.0 Flash-Lite	X	X	X
Gemini 1.5 Flash	✔️	✔️	✔️
Gemini 1.5 Pro	✔️	✔️	✔️
Best Practices
Function and Parameter Descriptions: Be extremely clear and specific in your descriptions. The model relies on these to choose the correct function and provide appropriate arguments.
Naming: Use descriptive function names (without spaces, periods, or dashes).
Strong Typing: Use specific types (integer, string, enum) for parameters to reduce errors. If a parameter has a limited set of valid values, use an enum.
Tool Selection: While the model can use an arbitrary number of tools, providing too many can increase the risk of selecting an incorrect or suboptimal tool. For best results, aim to provide only the relevant tools for the context or task, ideally keeping the active set to a maximum of 10-20. Consider dynamic tool selection based on conversation context if you have a large total number of tools.
Prompt Engineering:
Provide context: Tell the model its role (e.g., "You are a helpful weather assistant.").
Give instructions: Specify how and when to use functions (e.g., "Don't guess dates; always use a future date for forecasts.").
Encourage clarification: Instruct the model to ask clarifying questions if needed.
Temperature: Use a low temperature (e.g., 0) for more deterministic and reliable function calls.
Validation: If a function call has significant consequences (e.g., placing an order), validate the call with the user before executing it.
Error Handling: Implement robust error handling in your functions to gracefully handle unexpected inputs or API failures. Return informative error messages that the model can use to generate helpful responses to the user.
Security: Be mindful of security when calling external APIs. Use appropriate authentication and authorization mechanisms. Avoid exposing sensitive data in function calls.
Token Limits: Function descriptions and parameters count towards your input token limit. If you're hitting token limits, consider limiting the number of functions or the length of the descriptions, break down complex tasks into smaller, more focused function sets.
Notes and Limitations
Only a subset of the OpenAPI schema is supported.

FunctionDeclaration
Structured representation of a function declaration as defined by the OpenAPI 3.03 specification. Included in this declaration are the function name and parameters. This FunctionDeclaration is a representation of a block of code that can be used as a Tool by the model and executed by the client.

Fields
name
string
Required. The name of the function. Must be a-z, A-Z, 0-9, or contain underscores and dashes, with a maximum length of 63.

description
string
Required. A brief description of the function.

parameters
object (Schema)
Optional. Describes the parameters to this function. Reflects the Open API 3.03 Parameter Object string Key: the name of the parameter. Parameter names are case sensitive. Schema Value: the Schema defining the type used for the parameter.

response
object (Schema)
Optional. Describes the output from this function in JSON Schema format. Reflects the Open API 3.03 Response Object. The Schema defines the type used for the response value of the function.
Supported parameter types in Python are limited.
Automatic function calling is a Python SDK feature only.

The Gemini API supports PDF input, including long documents (up to 3600 pages). Gemini models process PDFs with native vision, and are therefore able to understand both text and image contents inside documents. With native PDF vision support, Gemini models are able to:

Analyze diagrams, charts, and tables inside documents.
Extract information into structured output formats.
Answer questions about visual and text contents in documents.
Summarize documents.
Transcribe document content (e.g. to HTML) preserving layouts and formatting, for use in downstream applications (such as in RAG pipelines).
This tutorial demonstrates some possible ways to use the Gemini API with PDF documents. All output is text-only.

Before you begin
Before calling the Gemini API, ensure you have your SDK of choice installed, and a Gemini API key configured and ready to use.

Prompting with PDFs
This guide demonstrates how to upload and process PDFs using the File API or by including them as inline data.

Technical details
Gemini 1.5 Pro and 1.5 Flash support a maximum of 3,600 document pages. Document pages must be in one of the following text data MIME types:

PDF - application/pdf
JavaScript - application/x-javascript, text/javascript
Python - application/x-python, text/x-python
TXT - text/plain
HTML - text/html
CSS - text/css
Markdown - text/md
CSV - text/csv
XML - text/xml
RTF - text/rtf
Each document page is equivalent to 258 tokens.

While there are no specific limits to the number of pixels in a document besides the model's context window, larger pages are scaled down to a maximum resolution of 3072x3072 while preserving their original aspect ratio, while smaller pages are scaled up to 768x768 pixels. There is no cost reduction for pages at lower sizes, other than bandwidth, or performance improvement for pages at higher resolution.

For best results:

Rotate pages to the correct orientation before uploading.
Avoid blurry pages.
If using a single page, place the text prompt after the page.
PDF input
For PDF payloads under 20MB, you can choose between uploading base64 encoded documents or directly uploading locally stored files.

As inline data
You can process PDF documents directly from URLs. Here's a code snippet showing how to do this:


from google import genai
from google.genai import types
import httpx

client = genai.Client()

doc_url = "https://discovery.ucl.ac.uk/id/eprint/10089234/1/343019_3_art_0_py4t4l_convrt.pdf"  # Replace with the actual URL of your PDF

# Retrieve and encode the PDF byte
doc_data = httpx.get(doc_url).content

prompt = "Summarize this document"
response = client.models.generate_content(
  model="gemini-1.5-flash",
  contents=[
      types.Part.from_bytes(
        data=doc_data,
        mime_type='application/pdf',
      ),
      prompt])
print(response.text)
Locally stored PDFs
For locally stored PDFs, you can use the following approach:


from google import genai
from google.genai import types
import pathlib
import httpx

client = genai.Client()

doc_url = "https://discovery.ucl.ac.uk/id/eprint/10089234/1/343019_3_art_0_py4t4l_convrt.pdf"  # Replace with the actual URL of your PDF

# Retrieve and encode the PDF byte
filepath = pathlib.Path('file.pdf')
filepath.write_bytes(httpx.get(doc_url).content)

prompt = "Summarize this document"
response = client.models.generate_content(
  model="gemini-1.5-flash",
  contents=[
      types.Part.from_bytes(
        data=filepath.read_bytes(),
        mime_type='application/pdf',
      ),
      prompt])
print(response.text)
Large PDFs
You can use the File API to upload a document of any size. Always use the File API when the total request size (including the files, text prompt, system instructions, etc.) is larger than 20 MB.

Note: The File API lets you store up to 20 GB of files per project, with a per-file maximum size of 2 GB. Files are stored for 48 hours. They can be accessed in that period with your API key, but cannot be downloaded from the API. The File API is available at no cost in all regions where the Gemini API is available.
Call media.upload to upload a file using the File API. The following code uploads a document file and then uses the file in a call to models.generateContent.

Large PDFs from URLs
Use the File API for large PDF files available from URLs, simplifying the process of uploading and processing these documents directly through their URLs:


from google import genai
from google.genai import types
import io
import httpx

client = genai.Client()

long_context_pdf_path = "https://www.nasa.gov/wp-content/uploads/static/history/alsj/a17/A17_FlightPlan.pdf" # Replace with the actual URL of your large PDF

# Retrieve and upload the PDF using the File API
doc_io = io.BytesIO(httpx.get(long_context_pdf_path).content)

sample_doc = client.files.upload(
  # You can pass a path or a file-like object here
  file=doc_io, 
  config=dict(
    # It will guess the mime type from the file extension, but if you pass
    # a file-like object, you need to set the
    mime_type='application/pdf')
)

prompt = "Summarize this document"


response = client.models.generate_content(
  model="gemini-1.5-flash",
  contents=[sample_doc, prompt])
print(response.text)
Large PDFs stored locally

from google import genai
from google.genai import types
import pathlib
import httpx

client = genai.Client()

long_context_pdf_path = "https://www.nasa.gov/wp-content/uploads/static/history/alsj/a17/A17_FlightPlan.pdf" # Replace with the actual URL of your large PDF

# Retrieve the PDF
file_path = pathlib.Path('A17.pdf')
file_path.write_bytes(httpx.get(long_context_pdf_path).content)

# Upload the PDF using the File API
sample_file = client.files.upload(
  file=file_path,
)

prompt="Summarize this document"

response = client.models.generate_content(
  model="gemini-1.5-flash",
  contents=[sample_file, "Summarize this document"])
print(response.text)
You can verify the API successfully stored the uploaded file and get its metadata by calling files.get. Only the name (and by extension, the uri) are unique.


from google import genai
import pathlib

client = genai.Client()

fpath = pathlib.Path('example.txt')
fpath.write_text('hello')

file = client.files.upload('example.txt')

file_info = client.files.get(file.name)
print(file_info.model_dump_json(indent=4))
Multiple PDFs
The Gemini API is capable of processing multiple PDF documents in a single request, as long as the combined size of the documents and the text prompt stays within the model's context window.


from google import genai
import io
import httpx

client = genai.Client()

doc_url_1 = "https://arxiv.org/pdf/2312.11805" # Replace with the URL to your first PDF
doc_url_2 = "https://arxiv.org/pdf/2403.05530" # Replace with the URL to your second PDF

# Retrieve and upload both PDFs using the File API
doc_data_1 = io.BytesIO(httpx.get(doc_url_1).content)
doc_data_2 = io.BytesIO(httpx.get(doc_url_2).content)

sample_pdf_1 = client.files.upload(
  file=doc_data_1,
  config=dict(mime_type='application/pdf')
)
sample_pdf_2 = client.files.upload(
  file=doc_data_2,
  config=dict(mime_type='application/pdf')
)

prompt = "What is the difference between each of the main benchmarks between these two papers? Output these in a table."

response = client.models.generate_content(
  model="gemini-1.5-flash",
  contents=[sample_pdf_1, sample_pdf_2, prompt])
print(response.text)
List files
You can list all files uploaded using the File API and their URIs using files.list.


from google import genai

client = genai.Client()

print("My files:")
for f in client.files.list():
    print("  ", f.name)
Delete files
Files uploaded using the File API are automatically deleted after 2 days. You can also manually delete them using files.delete.


from google import genai
import pathlib

client = genai.Client()

fpath = pathlib.Path('example.txt')
fpath.write_text('hello')

file = client.files.upload('example.txt')

client.files.delete(file.name)
Context caching with PDFs

from google import genai
from google.genai import types
import io
import httpx

client = genai.Client()

long_context_pdf_path = "https://www.nasa.gov/wp-content/uploads/static/history/alsj/a17/A17_FlightPlan.pdf" # Replace with the actual URL of your large PDF

# Retrieve and upload the PDF using the File API
doc_io = io.BytesIO(httpx.get(long_context_pdf_path).content)

document = client.files.upload(
  file=doc_io,
  config=dict(mime_type='application/pdf')
)

# Specify the model name and system instruction for caching
model_name = "gemini-1.5-flash-002" # Ensure this matches the model you intend to use
system_instruction = "You are an expert analyzing transcripts."

# Create a cached content object
cache = client.caches.create(
    model=model_name,
    config=types.CreateCachedContentConfig(
      system_instruction=system_instruction,
      contents=[document], # The document(s) and other content you wish to cache
    )
)

# Display the cache details
print(f'{cache=}')

# Generate content using the cached prompt and document
response = client.models.generate_content(
  model=model_name,
  contents="Please summarize this transcript",
  config=types.GenerateContentConfig(
    cached_content=cache.name
  ))

# (Optional) Print usage metadata for insights into the API call
print(f'{response.usage_metadata=}')

# Print the generated text
print('\n\n', response.text)
List caches
It's not possible to retrieve or view cached content, but you can retrieve cache metadata (name, model, display_name, usage_metadata, create_time, update_time, and expire_time).

To list metadata for all uploaded caches, use CachedContent.list():


from google import genai

client = genai.Client()
for c in client.caches.list():
  print(c)
Update a cache
You can set a new ttl or expire_time for a cache. Changing anything else about the cache isn't supported.

The following example shows how to update the ttl of a cache using CachedContent.update().


from google import genai
from google.genai import types
import datetime

client = genai.Client()

model_name = "models/gemini-1.5-flash-002" 

cache = client.caches.create(
    model=model_name,
    config=types.CreateCachedContentConfig(
      contents=['hello']
    )
)

client.caches.update(
  name = cache.name,
  config=types.UpdateCachedContentConfig(
    ttl=f'{datetime.timedelta(hours=2).total_seconds()}s'
  )
)
Delete a cache
The caching service provides a delete operation for manually removing content from the cache. The following example shows how to delete a cache using CachedContent.delete().


from google import genai
from google.genai import types
import datetime

client = genai.Client()

model_name = "models/gemini-1.5-flash-002" 

cache = client.caches.create(
    model=model_name,
    config=types.CreateCachedContentConfig(
      contents=['hello']
    )
)

client.caches.delete(name = cache.name)

The Grounding with Google Search feature in the Gemini API and AI Studio can be used to improve the accuracy and recency of responses from the model. In addition to more factual responses, when Grounding with Google Search is enabled, the Gemini API returns grounding sources (in-line supporting links) and Google Search Suggestions along with the response content. The Search Suggestions point users to the search results corresponding to the grounded response.

This guide will help you get started with Grounding with Google Search.

Before you begin
Before calling the Gemini API, ensure you have your SDK of choice installed, and a Gemini API key configured and ready to use.

Configure Search Grounding
Starting with Gemini 2.0, Google Search is available as a tool. This means that the model can decide when to use Google Search. The following example shows how to configure Search as a tool.


from google import genai
from google.genai.types import Tool, GenerateContentConfig, GoogleSearch

client = genai.Client()
model_id = "gemini-2.0-flash"

google_search_tool = Tool(
    google_search = GoogleSearch()
)

response = client.models.generate_content(
    model=model_id,
    contents="When is the next total solar eclipse in the United States?",
    config=GenerateContentConfig(
        tools=[google_search_tool],
        response_modalities=["TEXT"],
    )
)

for each in response.candidates[0].content.parts:
    print(each.text)
# Example response:
# The next total solar eclipse visible in the contiguous United States will be on ...

# To get grounding metadata as web content.
print(response.candidates[0].grounding_metadata.search_entry_point.rendered_content)
The Search-as-a-tool functionality also enables multi-turn searches. Combining Search with function calling is not yet supported.

Search as a tool enables complex prompts and workflows that require planning, reasoning, and thinking:

Grounding to enhance factuality and recency and provide more accurate answers
Retrieving artifacts from the web to do further analysis on
Finding relevant images, videos, or other media to assist in multimodal reasoning or generation tasks
Coding, technical troubleshooting, and other specialized tasks
Finding region-specific information or assisting in translating content accurately
Finding relevant websites for further browsing
Grounding with Google Search works with all available languages when doing text prompts. On the paid tier of the Gemini Developer API, you can get 1,500 Grounding with Google Search queries per day for free, with additional queries billed at the standard $35 per 1,000 queries.

You can learn more by trying the Search tool notebook.

Google Search Suggestions
To use Grounding with Google Search, you have to display Google Search Suggestions, which are suggested queries included in the metadata of the grounded response. To learn more about the display requirements, see Use Google Search Suggestions.

Google Search retrieval
Note: Google Search retrieval is only compatible with Gemini 1.5 models. For Gemini 2.0 models, you should use Search as a tool.
To configure a model to use Google Search retrieval, pass in the appropriate tool.

Note that Google Search retrieval is only compatible with the 1.5 models, later models need to use the Search Grounding. If you try to use it, the SDK will convert your code to use the Search Grounding instead and will ignore the dynamic threshold settings.

Getting started

from google import genai
from google.genai import types

client = genai.Client(api_key="GEMINI_API_KEY")

response = client.models.generate_content(
    model='gemini-1.5-flash',
    contents="Who won the US open this year?",
    config=types.GenerateContentConfig(
        tools=[types.Tool(
            google_search=types.GoogleSearchRetrieval
        )]
    )
)
print(response)
Dynamic threshold
The dynamic_threshold settings let you control the retrieval behavior, giving you additional control over when Grounding with Google Search is used.


from google import genai
from google.genai import types

client = genai.Client(api_key="GEMINI_API_KEY")

response = client.models.generate_content(
    model='gemini-1.5-flash',
    contents="Who won Roland Garros this year?",
    config=types.GenerateContentConfig(
        tools=[types.Tool(
            google_search=types.GoogleSearchRetrieval(
                dynamic_retrieval_config=types.DynamicRetrievalConfig(
                    dynamic_threshold=0.6))
        )]
    )
)
print(response)
Dynamic retrieval
Note: Dynamic retrieval is only compatible with Gemini 1.5 Flash. For Gemini 2.0, you should use Search as a tool, as shown above.
Some queries are likely to benefit more from Grounding with Google Search than others. The dynamic retrieval feature gives you additional control over when to use Grounding with Google Search.

If the dynamic retrieval mode is unspecified, Grounding with Google Search is always triggered. If the mode is set to dynamic, the model decides when to use grounding based on a threshold that you can configure. The threshold is a floating-point value in the range [0,1] and defaults to 0.3. If the threshold value is 0, the response is always grounded with Google Search; if it's 1, it never is.

How dynamic retrieval works
You can use dynamic retrieval in your request to choose when to turn on Grounding with Google Search. This is useful when the prompt doesn't require an answer grounded in Google Search and the model can provide an answer based on its own knowledge without grounding. This helps you manage latency, quality, and cost more effectively.

Before you invoke the dynamic retrieval configuration in your request, understand the following terminology:

Prediction score: When you request a grounded answer, Gemini assigns a prediction score to the prompt. The prediction score is a floating point value in the range [0,1]. Its value depends on whether the prompt can benefit from grounding the answer with the most up-to-date information from Google Search. Thus, if a prompt requires an answer grounded in the most recent facts on the web, it has a higher prediction score. A prompt for which a model-generated answer is sufficient has a lower prediction score.

Here are examples of some prompts and their prediction scores.

Note: The prediction scores are assigned by Gemini and can vary over time depending on several factors.
Prompt	Prediction score	Comment
"Write a poem about peonies"	0.13	The model can rely on its knowledge and the answer doesn't need grounding.
"Suggest a toy for a 2yo child"	0.36	The model can rely on its knowledge and the answer doesn't need grounding.
"Can you give a recipe for an asian-inspired guacamole?"	0.55	Google Search can give a grounded answer, but grounding isn't strictly required; the model knowledge might be sufficient.
"What's Agent Builder? How is grounding billed in Agent Builder?"	0.72	Requires Google Search to generate a well-grounded answer.
"Who won the latest F1 grand prix?"	0.97	Requires Google Search to generate a well-grounded answer.
Threshold: In your API request, you can specify a dynamic retrieval configuration with a threshold. The threshold is a floating point value in the range [0,1] and defaults to 0.3. If the threshold value is zero, the response is always grounded with Google Search. For all other values of threshold, the following is applicable:

If the prediction score is greater than or equal to the threshold, the answer is grounded with Google Search. A lower threshold implies that more prompts have responses that are generated using Grounding with Google Search.
If the prediction score is less than the threshold, the model might still generate the answer, but it isn't grounded with Google Search.
To learn how to set the dynamic retrieval threshold using an SDK or the REST API, see the appropriate code example.

To find a good threshold that suits your business needs, you can create a representative set of queries that you expect to encounter. Then you can sort the queries according to the prediction score in the response and select a good threshold for your use case.

A grounded response
If your prompt successfully grounds to Google Search, the response will include groundingMetadata. A grounded response might look something like this (parts of the response have been omitted for brevity):


{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "Carlos Alcaraz won the Gentlemen's Singles title at the 2024 Wimbledon Championships. He defeated Novak Djokovic in the final, winning his second consecutive Wimbledon title and fourth Grand Slam title overall. \n"
          }
        ],
        "role": "model"
      },
      ...
      "groundingMetadata": {
        "searchEntryPoint": {
          "renderedContent": "\u003cstyle\u003e\n.container {\n  align-items: center;\n  border-radius: 8px;\n  display: flex;\n  font-family: Google Sans, Roboto, sans-serif;\n  font-size: 14px;\n  line-height: 20px;\n  padding: 8px 12px;\n}\n.chip {\n  display: inline-block;\n  border: solid 1px;\n  border-radius: 16px;\n  min-width: 14px;\n  padding: 5px 16px;\n  text-align: center;\n  user-select: none;\n  margin: 0 8px;\n  -webkit-tap-highlight-color: transparent;\n}\n.carousel {\n  overflow: auto;\n  scrollbar-width: none;\n  white-space: nowrap;\n  margin-right: -12px;\n}\n.headline {\n  display: flex;\n  margin-right: 4px;\n}\n.gradient-container {\n  position: relative;\n}\n.gradient {\n  position: absolute;\n  transform: translate(3px, -9px);\n  height: 36px;\n  width: 9px;\n}\n@media (prefers-color-scheme: light) {\n  .container {\n    background-color: #fafafa;\n    box-shadow: 0 0 0 1px #0000000f;\n  }\n  .headline-label {\n    color: #1f1f1f;\n  }\n  .chip {\n    background-color: #ffffff;\n    border-color: #d2d2d2;\n    color: #5e5e5e;\n    text-decoration: none;\n  }\n  .chip:hover {\n    background-color: #f2f2f2;\n  }\n  .chip:focus {\n    background-color: #f2f2f2;\n  }\n  .chip:active {\n    background-color: #d8d8d8;\n    border-color: #b6b6b6;\n  }\n  .logo-dark {\n    display: none;\n  }\n  .gradient {\n    background: linear-gradient(90deg, #fafafa 15%, #fafafa00 100%);\n  }\n}\n@media (prefers-color-scheme: dark) {\n  .container {\n    background-color: #1f1f1f;\n    box-shadow: 0 0 0 1px #ffffff26;\n  }\n  .headline-label {\n    color: #fff;\n  }\n  .chip {\n    background-color: #2c2c2c;\n    border-color: #3c4043;\n    color: #fff;\n    text-decoration: none;\n  }\n  .chip:hover {\n    background-color: #353536;\n  }\n  .chip:focus {\n    background-color: #353536;\n  }\n  .chip:active {\n    background-color: #464849;\n    border-color: #53575b;\n  }\n  .logo-light {\n    display: none;\n  }\n  .gradient {\n    background: linear-gradient(90deg, #1f1f1f 15%, #1f1f1f00 100%);\n  }\n}\n\u003c/style\u003e\n\u003cdiv class=\"container\"\u003e\n  \u003cdiv class=\"headline\"\u003e\n    \u003csvg class=\"logo-light\" width=\"18\" height=\"18\" viewBox=\"9 9 35 35\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"\u003e\n      \u003cpath fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M42.8622 27.0064C42.8622 25.7839 42.7525 24.6084 42.5487 23.4799H26.3109V30.1568H35.5897C35.1821 32.3041 33.9596 34.1222 32.1258 35.3448V39.6864H37.7213C40.9814 36.677 42.8622 32.2571 42.8622 27.0064V27.0064Z\" fill=\"#4285F4\"/\u003e\n      \u003cpath fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M26.3109 43.8555C30.9659 43.8555 34.8687 42.3195 37.7213 39.6863L32.1258 35.3447C30.5898 36.3792 28.6306 37.0061 26.3109 37.0061C21.8282 37.0061 18.0195 33.9811 16.6559 29.906H10.9194V34.3573C13.7563 39.9841 19.5712 43.8555 26.3109 43.8555V43.8555Z\" fill=\"#34A853\"/\u003e\n      \u003cpath fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M16.6559 29.8904C16.3111 28.8559 16.1074 27.7588 16.1074 26.6146C16.1074 25.4704 16.3111 24.3733 16.6559 23.3388V18.8875H10.9194C9.74388 21.2072 9.06992 23.8247 9.06992 26.6146C9.06992 29.4045 9.74388 32.022 10.9194 34.3417L15.3864 30.8621L16.6559 29.8904V29.8904Z\" fill=\"#FBBC05\"/\u003e\n      \u003cpath fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M26.3109 16.2386C28.85 16.2386 31.107 17.1164 32.9095 18.8091L37.8466 13.8719C34.853 11.082 30.9659 9.3736 26.3109 9.3736C19.5712 9.3736 13.7563 13.245 10.9194 18.8875L16.6559 23.3388C18.0195 19.2636 21.8282 16.2386 26.3109 16.2386V16.2386Z\" fill=\"#EA4335\"/\u003e\n    \u003c/svg\u003e\n    \u003csvg class=\"logo-dark\" width=\"18\" height=\"18\" viewBox=\"0 0 48 48\" xmlns=\"http://www.w3.org/2000/svg\"\u003e\n      \u003ccircle cx=\"24\" cy=\"23\" fill=\"#FFF\" r=\"22\"/\u003e\n      \u003cpath d=\"M33.76 34.26c2.75-2.56 4.49-6.37 4.49-11.26 0-.89-.08-1.84-.29-3H24.01v5.99h8.03c-.4 2.02-1.5 3.56-3.07 4.56v.75l3.91 2.97h.88z\" fill=\"#4285F4\"/\u003e\n      \u003cpath d=\"M15.58 25.77A8.845 8.845 0 0 0 24 31.86c1.92 0 3.62-.46 4.97-1.31l4.79 3.71C31.14 36.7 27.65 38 24 38c-5.93 0-11.01-3.4-13.45-8.36l.17-1.01 4.06-2.85h.8z\" fill=\"#34A853\"/\u003e\n      \u003cpath d=\"M15.59 20.21a8.864 8.864 0 0 0 0 5.58l-5.03 3.86c-.98-2-1.53-4.25-1.53-6.64 0-2.39.55-4.64 1.53-6.64l1-.22 3.81 2.98.22 1.08z\" fill=\"#FBBC05\"/\u003e\n      \u003cpath d=\"M24 14.14c2.11 0 4.02.75 5.52 1.98l4.36-4.36C31.22 9.43 27.81 8 24 8c-5.93 0-11.01 3.4-13.45 8.36l5.03 3.85A8.86 8.86 0 0 1 24 14.14z\" fill=\"#EA4335\"/\u003e\n    \u003c/svg\u003e\n    \u003cdiv class=\"gradient-container\"\u003e\u003cdiv class=\"gradient\"\u003e\u003c/div\u003e\u003c/div\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"carousel\"\u003e\n    \u003ca class=\"chip\" href=\"https://vertexaisearch.cloud.google.com/grounding-api-redirect/AWhgh4x8Epe-gzpwRBvp7o3RZh2m1ygq1EHktn0OWCtvTXjad4bb1zSuqfJd6OEuZZ9_SXZ_P2SvCpJM7NaFfQfiZs6064MeqXego0vSbV9LlAZoxTdbxWK1hFeqTG6kA13YJf7Fbu1SqBYM0cFM4zo0G_sD9NKYWcOCQMvDLDEJFhjrC9DM_QobBIAMq-gWN95G5tvt6_z6EuPN8QY=\"\u003ewho won wimbledon 2024\u003c/a\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n"
        },
        "groundingChunks": [
          {
            "web": {
              "uri": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AWhgh4whET1ta3sDETZvcicd8FeNe4z0VuduVsxrT677KQRp2rYghXI0VpfYbIMVI3THcTuMwggRCbFXS_wVvW0UmGzMe9h2fyrkvsnQPJyikJasNIbjJLPX0StM4Bd694-ZVle56MmRA4YiUvwSqad1w6O2opmWnw==",
              "title": "wikipedia.org"
            }
          },
          {
            "web": {
              "uri": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AWhgh4wR1M-9-yMPUr_KdHlnoAmQ8ZX90DtQ_vDYTjtP2oR5RH4tRP04uqKPLmesvo64BBkPeYLC2EpVDxv9ngO3S1fs2xh-e78fY4m0GAtgNlahUkm_tBm_sih5kFPc7ill9u2uwesNGUkwrQlmP2mfWNU5lMMr23HGktr6t0sV0QYlzQq7odVoBxYWlQ_sqWFH",
              "title": "wikipedia.org"
            }
          },
          {
            "web": {
              "uri": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AWhgh4wsDmROzbP-tmt8GdwCW_pqISTZ4IRbBuoaMyaHfcQg8WW-yKRQQvMDTPAuLxJh-8_U8_iw_6JKFbQ8M9oVYtaFdWFK4gOtL4RrC9Jyqc5BNpuxp6uLEKgL5-9TggtNvO97PyCfziDFXPsxylwI1HcfQdrz3Jy7ZdOL4XM-S5rC0lF2S3VWW0IEAEtS7WX861meBYVjIuuF_mIr3spYPqWLhbAY2Spj-4_ba8DjRvmevIFUhRuESTKvBfmpxNSM",
              "title": "cbssports.com"
            }
          },
          {
            "web": {
              "uri": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AWhgh4yzjLkorHiUKjhOPkWaZ9b4cO-cLG-02vlEl6xTBjMUjyhK04qSIclAa7heR41JQ6AAVXmNdS3WDrLOV4Wli-iezyzW8QPQ4vgnmO_egdsuxhcGk3-Fp8-yfqNLvgXFwY5mPo6QRhvplOFv0_x9mAcka18QuAXtj0SPvJfZhUEgYLCtCrucDS5XFc5HmRBcG1tqFdKSE1ihnp8KLdaWMhrUQI21hHS9",
              "title": "jagranjosh.com"
            }
          },
          {
            "web": {
              "uri": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AWhgh4y9L4oeNGWCatFz63b9PpP3ys-Wi_zwnkUT5ji9lY7gPUJQcsmmE87q88GSdZqzcx5nZG9usot5FYk2yK-FAGvCRE6JsUQJB_W11_kJU2HVV1BTPiZ4SAgm8XDFIxpCZXnXmEx5HUfRqQm_zav7CvS2qjA2x3__qLME6Jy7R5oza1C5_aqjQu422le9CaigThS5bvJoMo-ZGcXdBUCj2CqoXNVjMA==",
              "title": "apnews.com"
            }
          }
        ],
        "groundingSupports": [
          {
            "segment": {
              "endIndex": 85,
              "text": "Carlos Alcaraz won the Gentlemen's Singles title at the 2024 Wimbledon Championships."
            },
            "groundingChunkIndices": [
              0,
              1,
              2,
              3
            ],
            "confidenceScores": [
              0.97380733,
              0.97380733,
              0.97380733,
              0.97380733
            ]
          },
          {
            "segment": {
              "startIndex": 86,
              "endIndex": 210,
              "text": "He defeated Novak Djokovic in the final, winning his second consecutive Wimbledon title and fourth Grand Slam title overall."
            },
            "groundingChunkIndices": [
              1,
              0,
              4
            ],
            "confidenceScores": [
              0.96145374,
              0.96145374,
              0.96145374
            ]
          }
        ],
        "webSearchQueries": [
          "who won wimbledon 2024"
        ]
      }
    }
  ],
  ...
}
If the response doesn't include groundingMetadata, this means the response wasn't successfully grounded. There are several reasons this could happen, including low source relevance or incomplete information within the model response.

When a grounded result is generated, the metadata contains URIs that redirect to the publishers of the content that was used to generate the grounded result. These URIs contain the vertexaisearch subdomain, as in this truncated example: https://vertexaisearch.cloud.google.com/grounding-api-redirect/.... The metadata also contains the publishers' domains. The provided URIs remain accessible for 30 days after the grounded result is generated.

Important: The provided URIs must be directly accessible by the end users and must not be queried programmatically through automated means. If automated access is detected, the grounded answer generation service might stop providing the redirection URIs.
The renderedContent field within searchEntryPoint is the provided code for implementing Google Search Suggestions. See Use Google Search Suggestions to learn more.

The Gemini API supports several embedding models that generate embeddings for words, phrases, code, and sentences. The resulting embeddings can then be used for tasks such as semantic search, text classification, and clustering, among many others.

What are embeddings?
Embeddings are numerical representations of text (or other media formats) that capture relationships between inputs. Text embeddings work by converting text into arrays of floating point numbers, called vectors. These vectors are designed to capture the meaning of the text. The length of the embedding array is called the vector's dimensionality. A passage of text might be represented by a vector containing hundreds of dimensions.

Embeddings capture semantic meaning and context, which results in text with similar meanings having "closer" embeddings. For example, the sentence "I took my dog to the vet" and "I took my cat to the vet" would have embeddings that are close to each other in the vector space.

You can use embeddings to compare different texts and understand how they relate. For example, if the embeddings of the text "cat" and "dog" are close together you can infer that these words are similar in meaning, context, or both. This enables a variety of common AI use cases.

Before you begin
Before calling the Gemini API, ensure you have your SDK of choice installed, and a Gemini API key configured and ready to use.

Generate embeddings
Use the embedContent method to generate text embeddings:

Python
JavaScript
Go
REST

from google import genai

client = genai.Client(api_key="GEMINI_API_KEY")

result = client.models.embed_content(
        model="gemini-embedding-exp-03-07",
        contents="What is the meaning of life?")

print(result.embeddings)
You can also generate embeddings for multiple chunks at once by passing them in as a list of strings.

Task types
When building Retrieval Augmented Generation (RAG) systems, a common design is to use text embeddings to perform a similarity search. In some cases this can lead to degraded quality, because questions and their answers are not semantically similar. For example, a question like "Why is the sky blue?" and its answer "The scattering of sunlight causes the blue color," have distinctly different meanings as statements, which means that a RAG system won't automatically recognize their relation.

Task types enable you to generate optimized embeddings for specific tasks, saving you time and cost and improving performance.

Python
JavaScript
REST

from google import genai
from google.genai import types

client = genai.Client(api_key="GEMINI_API_KEY")

result = client.models.embed_content(
        model="gemini-embedding-exp-03-07",
        contents="What is the meaning of life?",
        config=types.EmbedContentConfig(task_type="SEMANTIC_SIMILARITY")
)
print(result.embeddings)
Supported task types
Task type	Description
SEMANTIC_SIMILARITY	Used to generate embeddings that are optimized to assess text similarity.
CLASSIFICATION	Used to generate embeddings that are optimized to classify texts according to preset labels.
CLUSTERING	Used to generate embeddings that are optimized to cluster texts based on their similarities.
RETRIEVAL_DOCUMENT, RETRIEVAL_QUERY, QUESTION_ANSWERING, and FACT_VERIFICATION	Used to generate embeddings that are optimized for document search or information retrieval.
CODE_RETRIEVAL_QUERY	Used to retrieve a code block based on a natural language query, such as sort an array or reverse a linked list. Embeddings of the code blocks are computed using RETRIEVAL_DOCUMENT.
Use cases
Text embeddings are used in a variety of common AI use cases, such as:

Information retrieval: You can use embeddings to retrieve semantically similar text given a piece of input text.

Document search tutorialtask

Clustering: Comparing groups of embeddings can help identify hidden trends.

Embedding clustering tutorialbubble_chart

Vector database: As you take different embedding use cases to production, it is common to store embeddings in a vector database.

Vector database tutorialbolt

Classification: You can train a model using embeddings to classify documents into categories.

Classification tutorialtoken

Embedding models
The Gemini API offers three models that generate text embeddings:

gemini-embedding-exp-03-07
text-embedding-004
embedding-001

Files API

You can use the Files API to upload and interact with media files. The Files API lets you store up to 20 GB of files per project, with a per-file maximum size of 2 GB. Files are stored for 48 hours. During that time, you can use the API to get metadata about the files, but you can't download the files. The Files API is available at no cost in all regions where the Gemini API is available.

This guide shows you how to work with media files using the Files API. The basic operations are the same for audio files, images, videos, documents, and other supported file types.

Upload a file
You can use the Files API to upload a media file. Always use the Files API when the total request size (including the files, text prompt, system instructions, etc.) is larger than 20 MB.

The following code uploads a file and then uses the file in a call to generateContent.

Python
JavaScript
Go
REST

from google import genai

client = genai.Client(api_key="GOOGLE_API_KEY")

myfile = client.files.upload(file="path/to/sample.mp3")

response = client.models.generate_content(
    model="gemini-2.0-flash", contents=["Describe this audio clip", myfile]
)

print(response.text)
Get metadata for a file
You can verify that the API successfully stored the uploaded file and get its metadata by calling files.get.

Python
JavaScript
Go
REST

myfile = client.files.upload(file='path/to/sample.mp3')
file_name = myfile.name
myfile = client.files.get(name=file_name)
print(myfile)
List uploaded files
You can upload multiple files using the Files API. The following code gets a list of all the files uploaded:

Python
JavaScript
Go
REST

print('My files:')
for f in client.files.list():
    print(' ', f.name)
Delete uploaded files
Files are automatically deleted after 48 hours. You can also manually delete an uploaded file:

Python
JavaScript
Go
REST

myfile = client.files.upload(file='path/to/sample.mp3')
client.files.delete(name=myfile.name)
Gemini and other generative AI models process input and output at a granularity called a token.

About tokens
Tokens can be single characters like z or whole words like cat. Long words are broken up into several tokens. The set of all tokens used by the model is called the vocabulary, and the process of splitting text into tokens is called tokenization.

For Gemini models, a token is equivalent to about 4 characters. 100 tokens is equal to about 60-80 English words.

When billing is enabled, the cost of a call to the Gemini API is determined in part by the number of input and output tokens, so knowing how to count tokens can be helpful.

Try out counting tokens in a Colab
You can try out counting tokens by using a Colab.

Try a Colab notebook
View notebook on GitHub
Context windows
The models available through the Gemini API have context windows that are measured in tokens. The context window defines how much input you can provide and how much output the model can generate. You can determine the size of the context window by calling the getModels endpoint or by looking in the models documentation.

In the following example, you can see that the gemini-1.5-flash model has an input limit of about 1,000,000 tokens and an output limit of about 8,000 tokens, which means a context window is 1,000,000 tokens.


import google.generativeai as genai

model_info = genai.get_model("models/gemini-1.5-flash")

# Returns the "context window" for the model,
# which is the combined input and output token limits.
print(f"{model_info.input_token_limit=}")
print(f"{model_info.output_token_limit=}")
# ( input_token_limit=30720, output_token_limit=2048 )

Count tokens
All input to and output from the Gemini API is tokenized, including text, image files, and other non-text modalities.

You can count tokens in the following ways:

Call count_tokens with the input of the request.
This returns the total number of tokens in the input only. You can make this call before sending the input to the model to check the size of your requests.

Use the usage_metadata attribute on the response object after calling generate_content.
This returns the total number of tokens in both the input and the output: total_token_count.
It also returns the token counts of the input and output separately: prompt_token_count (input tokens) and candidates_token_count (output tokens).

Count text tokens
If you call count_tokens with a text-only input, it returns the token count of the text in the input only (total_tokens). You can make this call before calling generate_content to check the size of your requests.

Another option is calling generate_content and then using the usage_metadata attribute on the response object to get the following:

The separate token counts of the input (prompt_token_count) and the output (candidates_token_count)
The total number of tokens in both the input and the output (total_token_count)

import google.generativeai as genai

model = genai.GenerativeModel("models/gemini-1.5-flash")

prompt = "The quick brown fox jumps over the lazy dog."

# Call `count_tokens` to get the input token count (`total_tokens`).
print("total_tokens: ", model.count_tokens(prompt))
# ( total_tokens: 10 )

response = model.generate_content(prompt)

# On the response for `generate_content`, use `usage_metadata`
# to get separate input and output token counts
# (`prompt_token_count` and `candidates_token_count`, respectively),
# as well as the combined token count (`total_token_count`).
print(response.usage_metadata)
# ( prompt_token_count: 11, candidates_token_count: 73, total_token_count: 84 )

Count multi-turn (chat) tokens
If you call count_tokens with the chat history, it returns the total token count of the text from each role in the chat (total_tokens).

Another option is calling send_message and then using the usage_metadata attribute on the response object to get the following:

The separate token counts of the input (prompt_token_count) and the output (candidates_token_count)
The total number of tokens in both the input and the output (total_token_count)
To understand how big your next conversational turn will be, you need to append it to the history when you call count_tokens.


import google.generativeai as genai

model = genai.GenerativeModel("models/gemini-1.5-flash")

chat = model.start_chat(
    history=[
        {"role": "user", "parts": "Hi my name is Bob"},
        {"role": "model", "parts": "Hi Bob!"},
    ]
)
# Call `count_tokens` to get the input token count (`total_tokens`).
print(model.count_tokens(chat.history))
# ( total_tokens: 10 )

response = chat.send_message(
    "In one sentence, explain how a computer works to a young child."
)

# On the response for `send_message`, use `usage_metadata`
# to get separate input and output token counts
# (`prompt_token_count` and `candidates_token_count`, respectively),
# as well as the combined token count (`total_token_count`).
print(response.usage_metadata)
# ( prompt_token_count: 25, candidates_token_count: 21, total_token_count: 46 )

from google.generativeai.types.content_types import to_contents

# You can call `count_tokens` on the combined history and content of the next turn.
print(model.count_tokens(chat.history + to_contents("What is the meaning of life?")))
# ( total_tokens: 56 )

Count multimodal tokens
All input to the Gemini API is tokenized, including text, image files, and other non-text modalities. Note the following high-level key points about tokenization of multimodal input during processing by the Gemini API:

With Gemini 2.0, image inputs with both dimensions <=384 pixels are counted as 258 tokens. Images larger in one or both dimensions are cropped and scaled as needed into tiles of 768x768 pixels, each counted as 258 tokens. Prior to Gemini 2.0, images used a fixed 258 tokens.

Video and audio files are converted to tokens at the following fixed rates: video at 263 tokens per second and audio at 32 tokens per second.

Image files
If you call count_tokens with a text-and-image input, it returns the combined token count of the text and the image in the input only (total_tokens). You can make this call before calling generate_content to check the size of your requests. You can also optionally call count_tokens on the text and the file separately.

Another option is calling generate_content and then using the usage_metadata attribute on the response object to get the following:

The separate token counts of the input (prompt_token_count) and the output (candidates_token_count)
The total number of tokens in both the input and the output (total_token_count)
Note: You'll get the same token count if you use a file uploaded using the File API or you provide the file as inline data.
Example that uses an uploaded image from the File API:


import google.generativeai as genai

model = genai.GenerativeModel("models/gemini-1.5-flash")

prompt = "Tell me about this image"
your_image_file = genai.upload_file(path=media / "organ.jpg")

# Call `count_tokens` to get the input token count
# of the combined text and file (`total_tokens`).
# An image's display or file size does not affect its token count.
# Optionally, you can call `count_tokens` for the text and file separately.
print(model.count_tokens([prompt, your_image_file]))
# ( total_tokens: 263 )

response = model.generate_content([prompt, your_image_file])
response.text
# On the response for `generate_content`, use `usage_metadata`
# to get separate input and output token counts
# (`prompt_token_count` and `candidates_token_count`, respectively),
# as well as the combined token count (`total_token_count`).
print(response.usage_metadata)
# ( prompt_token_count: 264, candidates_token_count: 80, total_token_count: 345 )

Example that provides the image as inline data:


import google.generativeai as genai

import PIL.Image

model = genai.GenerativeModel("models/gemini-1.5-flash")

prompt = "Tell me about this image"
your_image_file = PIL.Image.open(media / "organ.jpg")

# Call `count_tokens` to get the input token count
# of the combined text and file (`total_tokens`).
# An image's display or file size does not affect its token count.
# Optionally, you can call `count_tokens` for the text and file separately.
print(model.count_tokens([prompt, your_image_file]))
# ( total_tokens: 263 )

response = model.generate_content([prompt, your_image_file])

# On the response for `generate_content`, use `usage_metadata`
# to get separate input and output token counts
# (`prompt_token_count` and `candidates_token_count`, respectively),
# as well as the combined token count (`total_token_count`).
print(response.usage_metadata)
# ( prompt_token_count: 264, candidates_token_count: 80, total_token_count: 345 )

Video or audio files
Audio and video are each converted to tokens at the following fixed rates:

Video: 263 tokens per second
Audio: 32 tokens per second
If you call count_tokens with a text-and-video/audio input, it returns the combined token count of the text and the video/audio file in the input only (total_tokens). You can make this call before calling generate_content to check the size of your requests. You can also optionally call count_tokens on the text and the file separately.

Another option is calling generate_content and then using the usage_metadata attribute on the response object to get the following:

The separate token counts of the input (prompt_token_count) and the output (candidates_token_count)
The total number of tokens in both the input and the output (total_token_count)
Note: You'll get the same token count if you use a file uploaded using the File API or you provide the file as inline data.

import google.generativeai as genai

import time

model = genai.GenerativeModel("models/gemini-1.5-flash")

prompt = "Tell me about this video"
your_file = genai.upload_file(path=media / "Big_Buck_Bunny.mp4")

# Videos need to be processed before you can use them.
while your_file.state.name == "PROCESSING":
    print("processing video...")
    time.sleep(5)
    your_file = genai.get_file(your_file.name)

# Call `count_tokens` to get the input token count
# of the combined text and video/audio file (`total_tokens`).
# A video or audio file is converted to tokens at a fixed rate of tokens per second.
# Optionally, you can call `count_tokens` for the text and file separately.
print(model.count_tokens([prompt, your_file]))
# ( total_tokens: 300 )

response = model.generate_content([prompt, your_file])

# On the response for `generate_content`, use `usage_metadata`
# to get separate input and output token counts
# (`prompt_token_count` and `candidates_token_count`, respectively),
# as well as the combined token count (`total_token_count`).
print(response.usage_metadata)
# ( prompt_token_count: 301, candidates_token_count: 60, total_token_count: 361 )

System instructions and tools
System instructions and tools also count towards the total token count for the input.

If you use system instructions, the total_tokens count increases to reflect the addition of system_instruction.


import google.generativeai as genai

model = genai.GenerativeModel(model_name="gemini-1.5-flash")

prompt = "The quick brown fox jumps over the lazy dog."

print(model.count_tokens(prompt))
# total_tokens: 10

model = genai.GenerativeModel(
    model_name="gemini-1.5-flash", system_instruction="You are a cat. Your name is Neko."
)

# The total token count includes everything sent to the `generate_content` request.
# When you use system instructions, the total token count increases.
print(model.count_tokens(prompt))
# ( total_tokens: 21 )

If you use function calling, the total_tokens count increases to reflect the addition of tools.


import google.generativeai as genai

model = genai.GenerativeModel(model_name="gemini-1.5-flash")

prompt = "I have 57 cats, each owns 44 mittens, how many mittens is that in total?"

print(model.count_tokens(prompt))
# ( total_tokens: 22 )

def add(a: float, b: float):
    """returns a + b."""
    return a + b

def subtract(a: float, b: float):
    """returns a - b."""
    return a - b

def multiply(a: float, b: float):
    """returns a * b."""
    return a * b

def divide(a: float, b: float):
    """returns a / b."""
    return a / b

model = genai.GenerativeModel(
    "models/gemini-1.5-flash-001", tools=[add, subtract, multiply, divide]
)

# The total token count includes everything sent to the `generate_content` request.
# When you use tools (like function calling), the total token count increases.
print(model.count_tokens(prompt))
# ( total_tokens: 206 )
