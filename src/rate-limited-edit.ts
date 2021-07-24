import { MessageEmbed, Message } from 'discord.js';

export type Content = MessageEmbed;
export type SentResolve = (message: Message) => void;
export type ToBeEdited = {
  content: Content;
  editMsg: Message;
  resolve: SentResolve;
}
export type EditQueue =
  Map<
    string,
    {
      toBeEdited: ToBeEdited[],
      lastEditedTimestamp: number
    }
  >

/**
 * key -> server id
 */
const serverMessageQueue: EditQueue = new Map();
/**
 * key -> channel id
 */
const dmMessageQueue: EditQueue = new Map();

const minimumDelay = 1000; // Miliseconds

/**
 * Starts the queue clearing process.
 * @param queue
 * @param idInQueue
 */
function queueClearer(
  queue: EditQueue,
  idInQueue: string
) {
  setTimeout(
    async () => {
      const msgToEdit = queue.get(idInQueue).toBeEdited.shift();

      // update timestamp
      queue.set(idInQueue, {
        ...queue.get(idInQueue),
        lastEditedTimestamp: new Date().getTime()
      })

      // if there are more items in the queue, clear them
      if (queue.get(idInQueue).toBeEdited.length > 0) queueClearer(queue, idInQueue);

      // edit
      msgToEdit.resolve(await msgToEdit.editMsg.edit(msgToEdit.content));
    },
    minimumDelay
  )
}

/**
 *
 * @param editMsg Message to edit
 * @param isDM Whether the channel in which the message is sent is a dm
 * @param sendToId user id (if DM) or guild id
 * @param content the new content
 * @returns
 */
export async function edit(
  editMsg: Message,
  isDM: boolean,
  sendToId: string,
  content: Content
) {
  let queue: EditQueue; // Selected queue for this message
  let idInQueue: string;

  if (!isDM) queue = serverMessageQueue;
  else queue = dmMessageQueue;

  idInQueue = sendToId;
  const currentTime = new Date().getTime();

  // if there is no queue for this channel
  if (!queue.has(idInQueue)) {
    // initialize
    queue.set(idInQueue, {
      lastEditedTimestamp: currentTime,
      toBeEdited: []
    })

    // edit
    return await editMsg.edit(content);
  }

  // if there is already a queue but empty
  if (queue.get(idInQueue).toBeEdited.length === 0) {
    // if enough time has passed and rate limits will not be hit
    if (currentTime - queue.get(idInQueue).lastEditedTimestamp > minimumDelay) {
      // update the timestamp
      queue.set(idInQueue, {
        ...queue.get(idInQueue),
        lastEditedTimestamp: currentTime
      })

      // edit
      return await editMsg.edit(content);
    }
    else {
      // add to the queue
      return new Promise((resolve: SentResolve) => {
        queue.get(idInQueue).toBeEdited.push({
          content,
          editMsg,
          resolve
        })

        // start queue clearing prcoess
        queueClearer(queue, idInQueue);
      })
    }
  }
  else {
    // add to the queue but do not clear as a clearer will be active
    return new Promise((resolve: SentResolve) => {
      queue.get(idInQueue).toBeEdited.push({
        content,
        editMsg,
        resolve
      })
    })
  }
}
