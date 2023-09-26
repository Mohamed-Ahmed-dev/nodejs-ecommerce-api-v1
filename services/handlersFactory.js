const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatuers = require("../utils/apiFeatures");

//*============================================================= getAll handler
exports.getAll = (Model) =>
  asyncHandler(async (req, res, next) => {
    let filter = {};
    if (req.nestedObject) {
      filter = req.nestedObject;
    }

    const countsOfDocs = await Model.countDocuments();
    const features = new ApiFeatuers(req.query, Model.find(filter))
      .filter()
      .sort()
      .limitFields()
      .search()
      .paginate(countsOfDocs);

    const { paginationResult, mongooseQuery } = features;
    const documents = await mongooseQuery;

    res
      .status(201)
      .json({ results: documents.length, paginationResult, data: documents });
  });

//*============================================================= getOne handler
exports.getOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findById(req.params.id);

    if (!document) {
      next(new ApiError(`No document for this id : ${req.params.id}`, 404));
    } else {
      res.status(200).json({ data: document });
    }
  });

//*============================================================= create one handler
exports.createOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const Document = await Model.create(req.body);

    res.status(201).json({ data: Document });
  });

//*============================================================= update one handler
exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!document) {
      next(new ApiError(`No document for this id : ${req.params.id}`, 404));
    } else {
      res.status(200).json({ data: document });
    }
    // trigger
    document.save();
  });

//*============================================================= delete one handler
exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const document = await Model.findByIdAndDelete(id);

    if (!document) {
      next(new ApiError(`No document for this id : ${id}`, 404));
    } else {
      res.status(204).send();
    }
    // trigger
    document.deleteOne();
  });
