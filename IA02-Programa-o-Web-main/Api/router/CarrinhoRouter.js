const router = require('express').Router();
const CarrinhoController = require('../Controller/CarrinhoController.js');

router.get('/getAll', CarrinhoController.getAll);
router.post('/add', CarrinhoController.add);
router.patch('/update/:id', CarrinhoController.update);
router.delete('/delete/:id', CarrinhoController.delete);
router.delete('/clear', CarrinhoController.clear);

module.exports = router;
