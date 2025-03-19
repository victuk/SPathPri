import "dotenv/config";
import express from "express";
import path from "path";
import createError from "http-errors";
import mongoose from "mongoose";
import indexRouter from "./routes/index";;
import profile from "./routes/v1/profile";
import auth from "./routes/v1/auth";
import assessment from "./routes/v1/assessment";
import attendance from "./routes/v1/notecategory";
import student from "./routes/v1/student";
import note from "./routes/v1/note";
import bodyParser from "body-parser";
import cors from "cors";
import logger from "morgan";
import v1Routes from "./routes/v1Routes";

var app: express.Application = express();

const port = process.env.PORT || 4000;

mongoose.connect(`${process.env.MONGO}`)
.then(() => {
  console.log("Connected to database");
})
.catch((error) => {
  console.log(error);
});



// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(cors({origin: "*"}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(
//   bodyParser.urlencoded({
//     extended: true,
//   })
// );
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use("/v1", v1Routes);

app.get("/", (_req, res) => {
  res.send("I'm healthy");
});

// app.use('/', indexRouter);
// app.use('/v1/profile', profile);
// app.use("/v1/auth", auth);
// app.use("/v1/note", note);
// app.use("/v1/attendance", attendance);
// app.use("/v1/student", student);
// app.use("/v1/assessment", assessment);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err:any, req:express.Request, res:express.Response, _next:express.NextFunction) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(err);
  // send the error
  res.status(err.status || 500);
  res.json({
    successful: false,
    error: "internal-server-error"
  });
});

app.listen(port, () => {
  console.log(`TypeScript with Express http://localhost:${port}/`);
});

