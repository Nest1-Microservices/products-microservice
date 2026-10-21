import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}
  async create(createProductDto: CreateProductDto) {
    console.log({ createProductDto });
    const product = await this.prisma.product.create({
      data: createProductDto,
    });
    return product;
  }

  async findAll(paginationDto: PaginationDto) {
    //return this.prisma.product.findMany({});
    const { page, limit } = paginationDto;
    const totalPages = await this.prisma.product.count();
    /* const totalPages = await this.prisma.product.count({
      where: { available: true },
    }); */
    const lastPage = Math.ceil(totalPages / limit);
    /*return this.prisma.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });*/
    return {
      data: await this.prisma.product.findMany({
        //where: { available: true },
        skip: (page - 1) * limit,
        take: limit,
      }),
      meta: {
        total: totalPages,
        page: page,
        lastPage: lastPage,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findFirst({
      where: { id: id },
      //where: { id, available: true },
    });
    if (!product) {
      throw new NotFoundException(`Product with id #${id} not found`);
    }
    return product;
    /* const product = await this.prisma.product.findFirstOrThrow({
      where: { id: id },
    });
    return product; */
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: ___, ...data } = updateProductDto;
    await this.findOne(id);
    /* return this.prisma.product.update({
      where: { id: id },
      data: updateProductDto,
    }); */
    return this.prisma.product.update({
      where: { id: id },
      data: data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    //Hard delete, no usarlo, porque perderiamos la integridad referencial
    /*return this.prisma.product.delete({
      where: { id },
    }); */
    //soft delete
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        available: false,
      },
    });
    return {
      status: 200,
      msg: 'Product deleted successfully',
      product: product,
    };
  }
}
