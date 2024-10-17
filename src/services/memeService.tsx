import {
    GetMemesResponse,
    GetUserByIdResponse,
    GetMemeCommentsResponse,
    getMemes,
    getUserById,
    getMemeComments,
} from '../api'

export async function fetchMemes(
    token: string,
    page: number
): Promise<GetMemesResponse> {
    const memes: GetMemesResponse = await getMemes(token, page)

    // Uncomment and adjust this part if you want to include author and comments
    /*
  const memesWithAuthorAndComments = [];
  for (let meme of memes) {
    const author = await getUserById(token, meme.authorId);
    const comments: GetMemeCommentsResponse['results'] = [];
    const firstCommentPage = await getMemeComments(token, meme.id, 1);
    comments.push(...firstCommentPage.results);
    const remainingCommentPages = Math.ceil(firstCommentPage.total / firstCommentPage.pageSize) - 1;
    for (let i = 0; i < remainingCommentPages; i++) {
      const page = await getMemeComments(token, meme.id, i + 2);
      comments.push(...page.results);
    }
    const commentsWithAuthor: (GetMemeCommentsResponse['results'][0] & {
      author: GetUserByIdResponse;
    })[] = [];
    for (let comment of comments) {
      const commentAuthor = await getUserById(token, comment.authorId);
      commentsWithAuthor.push({ ...comment, author: commentAuthor });
    }
    memesWithAuthorAndComments.push({
      ...meme,
      author,
      comments: commentsWithAuthor,
    });
  }
  return memesWithAuthorAndComments;
  */

    return memes
}
