const prisma = require("../config/database");

class JurusanRepository {
  async createJurusan(data) {
    return prisma.jurusan.create({
      data: data,
    });
  }

  async updateJurusan(id, data) {
    const { name, description, prioritas, mediaIdsToDelete, newMediaData } =
      data;

    const jurusan = await prisma.jurusan.findUnique({
      where: { id: parseInt(id) },
      include: { media: true },
    });

    if (!jurusan) {
      throw new Error("Jurusan not found");
    }

    const NewMediaIdsToDelete = mediaIdsToDelete
      ? JSON.parse(mediaIdsToDelete).map((id) => parseInt(id))
      : [];
    // Delete the specified media if any
    if (NewMediaIdsToDelete.length > 0) {
      await prisma.media.deleteMany({
        where: {
          id: {
            in: NewMediaIdsToDelete,
          },
          Jurusan: {
            some: {
              id: parseInt(id),
            },
          },
        },
      });
    }

    return await prisma.jurusan.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        prioritas,
        media: { create: newMediaData },
      },
      include: {
        media: true,
      },
    });
  }

  async deleteJurusan(id) {
    const jurusan = await prisma.jurusan.findUnique({
      where: { id },
      include: { media: true },
    });

    if (!jurusan) {
      throw new Error("Jurusan not found");
    }

    // Delete the media
    await prisma.media.deleteMany({
      where: { id: { in: jurusan.media.map((media) => media.id) } },
    });

    //delete media in cloud also here
    //...

    return prisma.jurusan.delete({
      where: { id },
    });
  }

  async getAllJurusan() {
    return prisma.jurusan.findMany({
      orderBy: {
        prioritas: "asc",
      },
      include: {
        media: true,
      },
    });
  }

  async findJurusanById(id) {
    return prisma.jurusan.findFirst({
      where: { id: id },
      include: {
        media: true,
      },
    });
  }
}

module.exports = new JurusanRepository();