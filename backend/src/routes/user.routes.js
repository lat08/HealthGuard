const { Router } = require('express');
const userController = require('../controllers/user.controller');

const router = Router();

// ┌──────────────────────────────────────────────────────┐
// │  Users API  —  /api/v1/users                         │
// │                                                      │
// │  GET    /           Danh sách users (paginated)       │
// │  GET    /:id        Chi tiết 1 user                   │
// │  POST   /           Tạo mới user                      │
// │  PUT    /:id        Cập nhật toàn bộ                  │
// │  PATCH  /:id        Cập nhật một phần                 │
// │  DELETE /:id        Xoá user (soft delete)            │
// └──────────────────────────────────────────────────────┘

router.get('/',       userController.getAll);
router.get('/:id',    userController.getById);
router.post('/',      userController.create);
router.put('/:id',    userController.replace);
router.patch('/:id',  userController.update);
router.delete('/:id', userController.delete);

module.exports = router;
