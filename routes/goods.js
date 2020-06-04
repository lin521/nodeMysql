var express = require('express');
var router = express.Router();

//文件上传(multipart/form-data请求)
var multer = require('multer')
var uploadFolder = 'public/uploads/images'
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadFolder); // 保存的路径
    },
    filename: function(req, file, cb) {
        var singfileArray = file.originalname.split('.');
        var fileExtension = singfileArray[singfileArray.length - 1];
        cb(null, file.fieldname + '-' + Date.now() + '.' + fileExtension); // 保存文件名设置
    }
});
var upload = multer({ storage: storage })

var { sql, mysqlOperation } = require('../config/mysql/db')
var { static_url } = require('../config/config')

async function get_goods_category_tree() { //分类整合
    const sqlstr = sql
        .table('tp_goods_category')
        .field('id,name,parent_id,level')
        .where({ is_show: 1 })
        .select();
    const cat_list = await mysqlOperation.operation(sqlstr);
    var arr = []
    var crr = []
    var tree = []
    var result = []
    cat_list.forEach((item, index) => {
        if (item.level == 2) {
            if (arr[item.parent_id] == undefined) {
                arr[item.parent_id] = []
                arr[item.parent_id].push(item)
            } else {
                arr[item.parent_id].push(item)
            }
        }
        if (item.level == 3) {
            if (crr[item.parent_id] == undefined) {
                crr[item.parent_id] = []
                crr[item.parent_id].push(item)
            } else {
                crr[item.parent_id].push(item)
            }
        }
        if (item.level == 1) {
            tree.push(item)
        }
    })
    arr.forEach((item, index) => {
        item.forEach((v, k) => {
            arr[index][k]['children'] = crr[v.id] == '' ? [] : crr[v.id]
        })
    })
    tree.forEach((item, index) => {
        item['children'] = arr[item.id] == '' ? [] : arr[item.id]
        result[index] = item
    })
    return result;
}

router.get('/', (req, res) => {
    res.send('send')
})
router.post('/getCategory', async(req, res) => {
    let params = req.body;
    let where = {}
    let order = ''
    let list_rows = 15
    if (params.title) {
        where.goods_name = params.title
    }
    if (params.parent_id) {
        where.parent_id = parseInt(params.parent_id)
    }
    if (params.level) {
        where.level = parseInt(params.level)
    }
    if (params.sort == 'asc') {
        order = 'id asc'
    } else {
        order = 'id desc'
    }
    if (params.limit) {
        list_rows = params.limit
    }
    const sqlstr = sql
        .table('tp_goods_category')
        .where(where)
        .page(params.page, list_rows)
        .order(order)
        .select();
    const totlestr = sql
        .table('tp_goods_category')
        .where(where)
        .select();
    const totle = await mysqlOperation.operation(totlestr);

    const result = await mysqlOperation.operation(sqlstr);

    let data = {
        code: 201,
        data: {
            goodsCategory: {
                data: result,
                total: totle.length
            }
        }
    }
    res.json({...data })
})

router.post('/getBrand', async(req, res) => {
    let params = req.body;
    let where = {}
    let order = ''
    let list_rows = 15
    if (params.title) {
        where.name = { like: '%' + params.title + '%' }
    }
    if (params.sort == 'asc') {
        order = 'id asc'
    } else {
        order = 'id desc'
    }
    const sqlstr = sql
        .table('tp_brand')
        .where(where)
        .page(params.page, list_rows)
        .order(order)
        .select();
    const totlestr = sql
        .table('tp_brand')
        .where(where)
        .select();
    const totle = await mysqlOperation.operation(totlestr);
    const result = await mysqlOperation.operation(sqlstr);
    result.forEach((item, index) => {
        result[index].logo = static_url + item.logo
    })
    const category = await get_goods_category_tree()
    let data = {
        code: 201,
        data: {
            goodsBrands: {
                data: result,
                total: totle.length
            },
            category: category
        }
    }
    res.json({...data })
})

router.post('/uploadFile', upload.single('file'), async(req, res) => { //上传图片
    if (req.file) {
        let data = {
            code: 201,
            data: {
                result: {
                    url: 'http://localhost:3000/' + req.file.path
                }
            }
        }
        res.json({...data })
    }
})
router.post('/list', async(req, res) => {
    let params = req.body;
    let where = {}
    let order = ''
    let list_rows = 15
    if (params.title) {
        where.name = { like: '%' + params.title + '%' }
    }
    if (params.sort == 'asc') {
        order = 'goods_id asc'
    } else {
        order = 'goods_id desc'
    }
    const sqlstr = sql
        .table('tp_goods')
        .where(where)
        .page(params.page, list_rows)
        .order(order)
        .select();
    const totlestr = sql
        .table('tp_goods')
        .where(where)
        .select();

    const totle = await mysqlOperation.operation(totlestr);
    const result = await mysqlOperation.operation(sqlstr);
    result.forEach((item, index) => {
        result[index].original_img = static_url + item.original_img
    })
    let data = {
        code: 201,
        data: {
            goodsList: {
                data: result,
                total: totle.length
            }
        }
    }
    res.json({...data })
})
router.post('/goodList', async(req, res) => {
    // const sqlstr = sql
    //     .table('tp_goods')
    //     .field('goods_id,goods_name')
    //     .limit(1, 10)
    //     .select();
    // const result = await mysqlOperation.operation(sqlstr);
    // const result = await get_goods_category_tree()
    // res.json({ code: 200, goodList: result })
})

router.post('/getCategoryList', async(req, res) => {
    const category = await get_goods_category_tree()
    let data = {
        code: 201,
        message: 'SUCCESSS',
        data: {
            category: category
        }
    }
    res.json({...data })
})

router.post('/decorative', async(req, res) => {
    let params = req.body;
    let map = {
        'data_list': params.decorative
    }
    const sqlstr = sql
        .table('tp_decorative')
        .data(map)
        .where({ id: 1 })
        .update();
    const result = await mysqlOperation.operation(sqlstr);
    let data = {
        code: 201,
        message: 'SUCCESSS'
    }
    res.json({...data })
})

router.post('/getDecorative', async(req, res) => {
    const sqlstr = sql
        .table('tp_decorative')
        .where({ id: 1 })
        .select();
    const result = await mysqlOperation.operation(sqlstr);
    let data = {
        code: 201,
        message: 'SUCCESSS',
        data: result[0]
    }
    res.json({...data })
})

router.post('/goodEdit', async(req, res) => {
    let params = req.body;
    let map = {
        'goods_id': params.id
    }
    const sqlstr = sql
        .table('tp_goods')
        .where(map)
        .select();
    const result = await mysqlOperation.operation(sqlstr);
    let data = result[0]
    data.original_img = static_url + data.original_img
    let datas = {
        code: 201,
        message: 'SUCCESSS',
        data: {
            data: data
        }
    }
    res.json({...datas })
})

module.exports = router;