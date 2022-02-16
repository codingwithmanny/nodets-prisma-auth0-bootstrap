// Imports
// ========================================================
import { PrismaClient, Prisma } from '@prisma/client';
import { QueryUserFilters, User } from './types';
import dictionary from '../../utils/dictionary.json';

// Config
// ========================================================
const prisma = new PrismaClient();

// Queries
// ========================================================
/**
 *
 * @param param0
 * @returns
 */
export const QUERY_USERS = async ({
  query = null,
  take = 10,
  skip = 0,
  orderBy = 'id',
  sort = 'asc',
  findBy,
}: QueryUserFilters) => {
  const optionOrderBy = ['id', 'name', 'display'].includes(orderBy)
    ? orderBy
    : 'id';
  const optionSort = ['asc', 'desc'].includes(sort) ? sort : 'asc';
  const options: Prisma.UserFindManyArgs = {
    where: {},
  };

  if (findBy && query) {
    options.where = {
      [findBy]: query,
    };
  } else if (query) {
    options.where = {
      OR: [
        {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          display: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          providerId: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ],
    };
  }

  options.orderBy = {
    [optionOrderBy]: optionSort,
  };

  const pagination = {
    query,
    take,
    skip,
    orderBy: optionOrderBy,
    sort: optionSort,
    total: await prisma.user.count(options as Prisma.UserCountArgs),
  };

  options.take = take;
  options.skip = skip;

  const data = await prisma.user.findMany(options);

  return { data, pagination };
};

// /**
//  *
//  * @param id
//  */
// export const QUERY_USER = async (id: string) => {
//   const data = await prisma.user.findFirst({
//     where: {
//       id,
//     },
//   });

//   return { data };
// };

/**
 *
 * @param payload
 * @returns
 */
export const CREATE_USER = async (payload: Partial<User>) => {
  const data = await prisma.user.create({
    data: {
      name: payload.name as string,
      providerId: payload.providerId as string,
    },
  });

  return { data };
};

/**
 *
 * @param providerId
 * @param data
 * @returns
 */
export const UPDATE_USER = async (
  providerId: string,
  payload: Partial<User>,
) => {
  const user = await prisma.user.findFirst({
    where: {
      providerId,
    },
  });

  if (!user) return { data: null };
  if (payload?.display && user?.display)
    throw new Error(dictionary.USERS.ERROR.UPDATE.USERNAME);

  const update: Partial<User> = {};

  if (payload?.name) {
    update.name = payload.name;
  }

  if (payload?.display) {
    update.display = payload.display;
  }

  if (Object.keys(payload)?.length > 0) {
    update.updatedAt = new Date();
  }

  try {
    const data = await prisma.user.update({
      where: {
        providerId,
      },
      data: update,
    });

    return { data };
  } catch (error: any) {
    throw new Error(error);
  }
};

// /**
//  *
//  * @param id
//  */
// export const DELETE_USER = async (id: string) => {
//   if (
//     !(await prisma.user.findFirst({
//       where: {
//         id,
//       },
//     }))
//   )
//     return { data: null };

//   const data = await prisma.user.delete({
//     where: {
//       id,
//     },
//   });

//   return { data };
// };
