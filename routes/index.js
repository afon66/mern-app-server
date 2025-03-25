import { Router } from 'express'
import { UserController, PostController, CommentController, LikeController, FollowController } from '../controllers/_index.js'
import authenticationToken from '../middlewares/auth.js'
import uploads from '../middlewares/loaders.js'

const router = new Router() 

router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.get('/current', authenticationToken, UserController.current)
router.get('/users/:id', authenticationToken, UserController.getUserById)
router.put('/users/:id', authenticationToken, uploads.single('avatar'), UserController.updateUser)

router.post('/posts', authenticationToken, PostController.createPost)
router.get('/posts', authenticationToken, PostController.getAllPosts)
router.get('/posts/:id', authenticationToken, PostController.getPostById)
router.delete('/posts/:id', authenticationToken, PostController.deletePost)

router.post('/comments/', authenticationToken, CommentController.createComment)
router.delete('/comments/:id', authenticationToken, CommentController.deleteComment)
router.get('/comments', authenticationToken, CommentController.getAllComments)

router.post('/likes/', authenticationToken, LikeController.likePost)
router.delete('/likes/:id', authenticationToken, LikeController.unlikePost)

router.post('/follow', authenticationToken, FollowController.followUser)
router.delete('/unfollow/:id', authenticationToken, FollowController.unfollowUser)

export default router