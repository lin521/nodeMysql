var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyPaeser = require('body-parser')
var expressJwt = require('express-jwt');
const { secretKey } = require('./config/config');
const { verifyToken } = require('./utils/token');

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('short'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.resolve(__dirname, './')))
app.use(bodyPaeser.json());
app.use(bodyPaeser.urlencoded({
    extended: false
}));


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var goodsRouter = require('./routes/goods');
var tokenRouter = require('./routes/token');

app.use((req, res, next) => {
    const token = req.headers.authorization;
    console.log(token)
    if (token != undefined) {
        verifyToken(token).then(data => {
            req.data = data
            next();
        }).catch(err => {
            next()
        })
    } else {
        next()
    }
})

app.use(expressJwt({
    secret: secretKey
}).unless({
    path: ['/token/vueMiniUserInfo', '/good/getDecorative']
}));

// app.use('*', function(req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
//     res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
//     next()
// });


// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//     // next(createError(404));
//     // res.status(404).send("Error")
// });

// error handler
// app.use(function(err, req, res, next) {
//     // set locals, only providing error in development
//     // res.locals.message = err.message;
//     // res.locals.error = req.app.get('env') === 'development' ? err : {};

//     // // render the error page
//     // res.status(err.status || 500);
//     // res.render('error');
// });

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/good', goodsRouter);
app.use('/token', tokenRouter);

app.listen(3000);