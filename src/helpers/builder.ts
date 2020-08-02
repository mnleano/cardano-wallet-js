class Builder {
  success<T>(data: T) {
    return {
      data,
      code: 200,
      status: 'success',
    };
  }

  error(e: any) {
    const {
      code = 400,
      status = 'error',
      message = 'Opps, Something went wrong!',
    } = e;
    return {
      code,
      status,
      message,
    };
  }
}

const builder = new Builder();

export default builder;
