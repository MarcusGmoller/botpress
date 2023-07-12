import { z } from 'zod'

const keyboardButtonPollTypeSchema = z
  .object({
    type: z
      .enum(['QUIZ', 'REGULAR'])
      .optional()
      .describe('If QUIZ is passed, the user will be allowed to create only Quiz Mode polls'),
  })
  .optional()
  .describe(
    'This object represents type of a poll, which is allowed to be created while the user is pressing the button.'
  )

const keyboardButtonSchema = z.object({
  text: z
    .string()
    .max(64)
    .describe(
      'Text of the button. If none of the optional fields are used, it will be sent as a message when the button is pressed'
    ),
  request_contact: z.boolean().optional().describe("If True, the user's phone number will be requested"),
  request_location: z.boolean().optional().describe("If True, the user's current location will be requested"),
  request_poll: keyboardButtonPollTypeSchema.describe(
    'If specified, the user will be asked to create a poll and send it to the bot when the button is pressed.'
  ),
})

const loginUrlSchema = z
  .object({
    url: z
      .string()
      .max(64)
      .describe(
        'An HTTP URL to be opened with user authorization data added to the query string when the button is pressed'
      ),
    forward_text: z.string().max(64).optional().describe('New text of the button in forwarded messages.'),
    bot_username: z
      .string()
      .max(64)
      .optional()
      .describe('Username of a bot, which will be used for user authorization.'),
    request_write_access: z
      .boolean()
      .optional()
      .describe('True, if you have requested the permission to write to the user.'),
  })
  .optional()
  .describe('This object represents a parameter of the inline keyboard button used to automatically authorize a user')

const callbackGameSchema = z.object({}).describe('A placeholder, currently holds no information')

const inlineKeyboardButtonSchema = z.object({
  text: z.string().max(64).describe('Label text on the button'),
  url: z.string().optional().describe('HTTP or tg:// url to be opened when button is pressed'),
  login_url: loginUrlSchema.describe(
    'An HTTP URL used to automatically authorize the user. Can be used as a replacement for the Telegram Login Widget.'
  ),
  callback_data: z
    .string()
    .max(64)
    .optional()
    .describe('Data to be sent in a callback query to the bot when button is pressed, 1-64 bytes'),
  switch_inline_query: z
    .string()
    .optional()
    .describe(
      'If set, pressing the button will prompt the user to select one of their chats, open that chat and insert the bot‘s username and the specified inline query in the input field.'
    ),
  switch_inline_query_current_chat: z
    .string()
    .optional()
    .describe(
      "If set, pressing the button will insert the bot‘s username and the specified inline query in the current chat's input field."
    ),
  callback_game: callbackGameSchema
    .optional()
    .describe('Description of the game that will be launched when the user presses the button.'),
  pay: z.boolean().optional().describe('Specify True, to send a Pay button.'),
})

const forceReplySchema = z.object({
  force_reply: z
    .literal(true)
    .describe('Shows reply interface to the user, as a result the user will be forced to reply to your bots message.'),
  selective: z.boolean().optional().describe('Use this parameter if you want to force reply from specific users only.'),
})

const replyKeyboardMarkupSchema = z.object({
  keyboard: z
    .array(z.array(keyboardButtonSchema))
    .describe('Array of button rows, each represented by an Array of KeyboardButton objects'),
  resize_keyboard: z
    .boolean()
    .optional()
    .describe('Requests clients to resize the keyboard vertically for optimal fit.'),
  one_time_keyboard: z
    .boolean()
    .optional()
    .describe("Requests clients to hide the keyboard as soon as it's been used."),
  selective: z
    .boolean()
    .optional()
    .describe('Use this parameter if you want to show the keyboard to specific users only.'),
})

const inlineKeyboardMarkupSchema = z.object({
  inline_keyboard: z
    .array(z.array(inlineKeyboardButtonSchema))
    .describe('Array of button rows, each represented by an Array of InlineKeyboardButton objects.'),
  input_field_placeholder: z
    .string()
    .max(64)
    .optional()
    .describe('The placeholder to be shown in the input field when the keyboard is active; 1-64 characters.'),
})

const replyMarkupSchema = z
  .union([replyKeyboardMarkupSchema, inlineKeyboardMarkupSchema, forceReplySchema])
  .optional()
  .describe('Additional interface options that are available for the bot.')

const sendMessageSchema = z.object({
  function_name: z.literal('sendMessage'),
  text: z.string().max(4096).describe('Text of the message to be sent'),
  parse_mode: z
    .enum(['Markdown', 'MarkdownV2', 'HTML'])
    .optional()
    .describe(
      "Send Markdown, MarkdownV2, or HTML, if you want Telegram apps to show bold, italic, fixed-width text or inline URLs in your bot's message."
    ),
  reply_markup: replyMarkupSchema,
})

export const sendPhotoSchema = z.object({
  function_name: z.literal('sendPhoto'),
  photo: z.union([
    z.string().describe('Photo to send (file id, url, file path)'),
    z.object({ url: z.string(), filename: z.string() }),
  ]),
  caption: z.string().max(1024).optional().describe('Photo caption (0-1024 characters)'),
  reply_markup: replyMarkupSchema,
})

const sendAudioSchema = z.object({
  function_name: z.literal('sendAudio'),
  audio: z.string().describe('Audio to send (file id, url, file path)'),
  caption: z.string().max(1024).optional().describe('Audio caption (0-1024 characters)'),
  reply_markup: replyMarkupSchema,
})

const sendDocumentSchema = z.object({
  function_name: z.literal('sendDocument'),
  document: z.string().describe('Document to send (file id, url, file path)'),
  caption: z.string().max(1024).optional().describe('Document caption (0-1024 characters)'),
  reply_markup: replyMarkupSchema,
})

const sendVideoSchema = z.object({
  function_name: z.literal('sendVideo'),
  video: z.string().describe('Video to send (file id, url, file path)'),
  caption: z.string().max(1024).optional().describe('Video caption (0-1024 characters)'),
  reply_markup: replyMarkupSchema,
})

const sendLocationSchema = z.object({
  function_name: z.literal('sendLocation'),
  latitude: z.number().min(-90).max(90).describe('Latitude of the location'),
  longitude: z.number().min(-180).max(180).describe('Longitude of the location'),
  reply_markup: replyMarkupSchema,
})

const sendVenueSchema = sendLocationSchema
  .extend({
    function_name: z.literal('sendVenue'),
    title: z.string().describe('Name of the venue'),
    address: z.string().describe('Address of the venue'),
    foursquare_id: z.string().optional().describe('Optional Foursquare ID of the venue'),
    foursquare_type: z.string().optional().describe('Optional Foursquare type of the venue'),
  })
  .describe('Venue to send')

const sendContactSchema = z.object({
  function_name: z.literal('sendContact'),
  phone_number: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  reply_markup: replyMarkupSchema,
})

const sendAnimationSchema = z.object({
  function_name: z.literal('sendAnimation'),
  animation: z.string().describe('Animation to send (file id, url, file path)'),
  duration: z.number().optional().describe('Duration of the animation in seconds'),
  width: z.number().optional().describe('Animation width'),
  height: z.number().optional().describe('Animation height'),
  thumb: z.string().optional().describe('Thumbnail of the animation'),
  caption: z.string().max(1024).optional().describe('Animation caption (0-1024 characters)'),
  reply_markup: replyMarkupSchema,
})

const sendVoiceSchema = z.object({
  function_name: z.literal('sendVoice'),
  voice: z.string().describe('Voice to send (file id, url, file path)'),
  caption: z.string().max(1024).optional().describe('Voice message caption (0-1024 characters)'),
  duration: z.number().optional().describe('Duration of the voice message in seconds'),
  reply_markup: replyMarkupSchema,
})

const sendVideoNoteSchema = z.object({
  function_name: z.literal('sendVideoNote'),
  video_note: z.string().describe('Video note to send (file id, url, file path)'),
  length: z.number().optional().describe('Video width and height'),
  duration: z.number().optional().describe('Duration of the video in seconds'),
  thumb: z.string().optional().describe('Thumbnail of the video note'),
  reply_markup: replyMarkupSchema,
})

const InputMediaPhotoSchema = z.object({
  type: z.literal('photo'),
  media: z.string().describe('File to send. Pass a file_id to send a file that exists on the Telegram servers'),
  caption: z.string().optional().describe('Caption of the photo to be sent, 0-1024 characters after entities parsing'),
  parse_mode: z.enum(['Markdown', 'MarkdownV2', 'HTML']).optional(),
})

const InputMediaVideoSchema = z.object({
  type: z.literal('video'),
  media: z.string().describe('File to send. Pass a file_id to send a file that exists on the Telegram servers'),
  thumb: z.string().optional().describe('Thumbnail of the video sent'),
  caption: z.string().optional().describe('Caption of the video to be sent, 0-1024 characters after entities parsing'),
  parse_mode: z.enum(['Markdown', 'MarkdownV2', 'HTML']).optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  duration: z.number().optional(),
  supports_streaming: z.boolean().optional(),
})

const InputMediaSchema = z.union([InputMediaPhotoSchema, InputMediaVideoSchema])

const sendMediaGroupSchema = z.object({
  function_name: z.literal('sendMediaGroup'),
  media: z.array(InputMediaSchema).describe('Array of InputMediaPhoto and InputMediaVideo to send'),
  reply_markup: replyMarkupSchema,
})

const sendPollSchema = z.object({
  function_name: z.literal('sendPoll'),
  question: z.string().describe('Poll question, 1-300 characters'),
  options: z.array(z.string()).describe('List of answer options, 2-10 strings 1-100 characters each'),
  is_anonymous: z.boolean().optional().describe('True, if the poll needs to be anonymous'),
  type: z.enum(['regular', 'quiz']).optional().describe('Type of the poll'),
  allows_multiple_answers: z.boolean().optional().describe('True, if the poll allows multiple answers'),
  correct_option_id: z.number().optional().describe('0-based identifier of the correct answer option'),
  reply_markup: replyMarkupSchema,
})

const sendDiceSchema = z.object({
  function_name: z.literal('sendDice'),
  emoji: z.string().optional().describe('Emoji on which the dice throw animation is based'),
  reply_markup: replyMarkupSchema,
})

const sendChatActionSchema = z.object({
  function_name: z.literal('sendChatAction'),
  action: z.enum([
    'typing',
    'upload_photo',
    'record_video',
    'upload_video',
    'record_audio',
    'upload_audio',
    'upload_document',
    'find_location',
    'record_video_note',
    'upload_video_note',
  ]),
})

const sendStickerSchema = z.object({
  function_name: z.literal('sendSticker'),
  sticker: z.string().describe('Sticker to send (file id, url, file path)'),
  reply_markup: replyMarkupSchema,
})

const LabeledPriceSchema = z.object({
  label: z.string(),
  amount: z.number(),
})

const sendInvoiceSchema = z.object({
  function_name: z.literal('sendInvoice'),
  title: z.string().describe('Product name'),
  description: z.string().describe('Product description'),
  payload: z.string().describe('Unique deep-linking parameter that can be used to generate this invoice'),
  provider_token: z.string().describe('Payments provider token obtained via Botfather'),
  start_parameter: z.string().describe('Unique deep-linking parameter that can be used to generate this invoice'),
  currency: z.string().describe('Three-letter ISO 4217 currency code'),
  prices: z.array(LabeledPriceSchema).describe('Breakdown of prices'),
  reply_markup: replyMarkupSchema,
})

export const payloadSchema = z.array(
  z.discriminatedUnion('function_name', [
    sendMessageSchema,
    sendPhotoSchema,
    sendAudioSchema,
    sendDocumentSchema,
    sendVideoSchema,
    sendLocationSchema,
    sendVenueSchema,
    sendContactSchema,
    sendAnimationSchema,
    sendVoiceSchema,
    sendVideoNoteSchema,
    sendMediaGroupSchema,
    sendPollSchema,
    sendDiceSchema,
    sendChatActionSchema,
    sendStickerSchema,
    sendInvoiceSchema,
  ])
)
