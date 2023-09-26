class ApiFeatuers {
  constructor(QueryString, mongooseQuery) {
    this.QueryString = QueryString;
    this.mongooseQuery = mongooseQuery;
  }

  filter() {
    const queryStringObj = { ...this.QueryString };
    const excludesFields = ["page", "limit", "fields", "sort", "keyword"];
    excludesFields.forEach((field) => delete queryStringObj[field]);
    // apply feltring using [gte|gt|lte|lt].
    let querySt = JSON.stringify(queryStringObj);
    querySt = querySt.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const query = JSON.parse(querySt);
    this.mongooseQuery = this.mongooseQuery.find(query);
    return this;
  }

  sort() {
    if (this.QueryString.sort) {
      const sortBy = this.QueryString.sort.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.QueryString.fields) {
      const fields = this.QueryString.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }
    return this;
  }

  search(modelName) {
    if (this.QueryString.keyword) {
      let query = {};
      if (modelName === "ProductModel") {
        query.$or = [
          { name: { $regex: this.QueryString.keyword, $options: "i" } },
          { description: { $regex: this.QueryString.keyword, $options: "i" } },
        ];
      } else {
        query = { name: { $regex: this.QueryString.keyword, $options: "i" } };
      }

      this.mongooseQuery = this.mongooseQuery.find(query);
    }
    return this;
  }

  paginate(countsOfDocs) {
    const page = this.QueryString.page * 1 || 1;
    const limit = this.QueryString.limit * 1 || 50;
    const skip = (page - 1) * limit;
    const endIndex = page * limit;

    // return pagination result
    const pagination = {};
    pagination.currentPage = page;
    pagination.limit = limit;
    pagination.numberOfPages = Math.ceil(countsOfDocs / limit);
    // next page
    if (endIndex < countsOfDocs) {
      pagination.nextPageNumber = page + 1;
    }
    // prev page
    if (skip > 0) {
      pagination.prevPageNumber = page - 1;
    }

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    this.paginationResult = pagination;

    return this;
  }
}

module.exports = ApiFeatuers;
