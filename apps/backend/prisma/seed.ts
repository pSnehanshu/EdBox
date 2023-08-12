import prisma from "./index";
import _ from "lodash";

async function main() {
  const school = await prisma.school.create({
    data: {
      name: `EdBox Model School (${_.random(0, 100)})`,
      website: "https://www.indorhino.com/edbox",
      Classes: {
        createMany: {
          data: [
            { numeric_id: 1, order: 1, name: "I" },
            { numeric_id: 2, order: 2, name: "II" },
            { numeric_id: 3, order: 3, name: "III" },
            { numeric_id: 4, order: 4, name: "IV" },
            { numeric_id: 5, order: 5, name: "V" },
          ],
          skipDuplicates: true,
        },
      },
      Sections: {
        createMany: {
          data: [
            {
              class_id: 1,
              numeric_id: 1,
              name: "A",
            },
            {
              class_id: 1,
              numeric_id: 2,
              name: "B",
            },
            {
              class_id: 2,
              numeric_id: 1,
              name: "A",
            },
            {
              class_id: 2,
              numeric_id: 2,
              name: "B",
            },
            {
              class_id: 3,
              numeric_id: 1,
              name: "A",
            },
            {
              class_id: 3,
              numeric_id: 2,
              name: "B",
            },
            {
              class_id: 3,
              numeric_id: 3,
              name: "C",
            },
            {
              class_id: 4,
              numeric_id: 1,
              name: "A",
            },
            {
              class_id: 4,
              numeric_id: 2,
              name: "B",
            },
            {
              class_id: 5,
              numeric_id: 1,
              name: "A",
            },
            {
              class_id: 5,
              numeric_id: 2,
              name: "B",
            },
          ],
          skipDuplicates: true,
        },
      },
    },
  });

  await prisma.studentsBatch.create({
    data: {
      numeric_id: 1,
      school_id: school.id,
      class_id: 3,
    },
  });

  const teacher = await prisma.teacher.create({
    data: {
      school_id: school.id,
      User: {
        connectOrCreate: {
          where: {
            phone_isd_code_phone_school_id: {
              phone: "9876543210",
              phone_isd_code: 91,
              school_id: school.id,
            },
          },
          create: {
            name: "Snehanshu Phukon",
            school_id: school.id,
            phone: "9876543210",
            gender: "Male",
          },
        },
      },
    },
    include: { User: true },
  });

  const parent1 = await prisma.parent.create({
    data: {
      school_id: school.id,
      User: { connect: { id: teacher.User?.id } },
    },
  });

  const student = await prisma.student.create({
    data: {
      school_id: school.id,
      joining_batch_num: 1,
      current_batch_num: 1,
      roll_num: 1,
      section: 1,
      User: {
        create: {
          name: "Ayushman Phukan",
          school_id: school.id,
          gender: "Male",
        },
      },
    },
    include: { User: true },
  });

  const parent2 = await prisma.parent.create({
    data: {
      school_id: school.id,
      User: {
        connectOrCreate: {
          where: {
            phone_isd_code_phone_school_id: {
              phone: "8765432109",
              phone_isd_code: 91,
              school_id: school.id,
            },
          },
          create: {
            name: "Seema Rani",
            school_id: school.id,
            phone: "8765432109",
            gender: "Female",
          },
        },
      },
    },
    include: { User: true },
  });

  await prisma.parentStudent_mapping.createMany({
    data: [
      { parent_id: parent1.id, student_id: student.id },
      { parent_id: parent2.id, student_id: student.id },
    ],
  });

  await prisma.schoolStaff.create({
    data: {
      school_id: school.id,
      role: "principal",
      User: {
        connect: {
          id: parent2.User?.id,
        },
      },
    },
  });

  await prisma.subject.create({
    data: {
      name: "Maths",
      school_id: school.id,
      Periods: {
        createMany: {
          data: [
            {
              class_id: 3,
              section_id: 1,
              school_id: school.id,
              day_of_week: "mon",
              start_hour: 8,
              start_min: 0,
              end_hour: 8,
              end_min: 45,
              teacher_id: teacher.id,
            },
            {
              class_id: 3,
              section_id: 1,
              school_id: school.id,
              day_of_week: "tue",
              start_hour: 8,
              start_min: 0,
              end_hour: 8,
              end_min: 45,
              teacher_id: teacher.id,
            },
            {
              class_id: 3,
              section_id: 1,
              school_id: school.id,
              day_of_week: "wed",
              start_hour: 8,
              start_min: 0,
              end_hour: 8,
              end_min: 45,
              teacher_id: teacher.id,
            },
            {
              class_id: 3,
              section_id: 1,
              school_id: school.id,
              day_of_week: "thu",
              start_hour: 8,
              start_min: 0,
              end_hour: 8,
              end_min: 45,
              teacher_id: teacher.id,
            },
            {
              class_id: 3,
              section_id: 1,
              school_id: school.id,
              day_of_week: "fri",
              start_hour: 8,
              start_min: 0,
              end_hour: 8,
              end_min: 45,
              teacher_id: teacher.id,
            },
            {
              class_id: 3,
              section_id: 1,
              school_id: school.id,
              day_of_week: "sat",
              start_hour: 8,
              start_min: 0,
              end_hour: 8,
              end_min: 45,
              teacher_id: teacher.id,
            },
          ],
          skipDuplicates: true,
        },
      },
    },
  });

  await prisma.subject.create({
    data: {
      name: "Science",
      school_id: school.id,
      Periods: {
        createMany: {
          data: [
            {
              class_id: 3,
              section_id: 1,
              school_id: school.id,
              day_of_week: "mon",
              start_hour: 8,
              start_min: 45,
              end_hour: 9,
              end_min: 30,
              teacher_id: teacher.id,
            },
            {
              class_id: 3,
              section_id: 1,
              school_id: school.id,
              day_of_week: "tue",
              start_hour: 8,
              start_min: 45,
              end_hour: 9,
              end_min: 30,
              teacher_id: teacher.id,
            },
            {
              class_id: 3,
              section_id: 1,
              school_id: school.id,
              day_of_week: "wed",
              start_hour: 8,
              start_min: 45,
              end_hour: 9,
              end_min: 30,
              teacher_id: teacher.id,
            },
            {
              class_id: 3,
              section_id: 1,
              school_id: school.id,
              day_of_week: "thu",
              start_hour: 8,
              start_min: 45,
              end_hour: 9,
              end_min: 30,
              teacher_id: teacher.id,
            },
            {
              class_id: 3,
              section_id: 1,
              school_id: school.id,
              day_of_week: "fri",
              start_hour: 8,
              start_min: 45,
              end_hour: 9,
              end_min: 30,
              teacher_id: teacher.id,
            },
            {
              class_id: 3,
              section_id: 1,
              school_id: school.id,
              day_of_week: "sat",
              start_hour: 8,
              start_min: 45,
              end_hour: 9,
              end_min: 30,
              teacher_id: teacher.id,
            },
          ],
          skipDuplicates: true,
        },
      },
    },
  });

  await prisma.subject.create({
    data: {
      name: "English",
      school_id: school.id,
      Periods: {
        createMany: {
          data: [
            {
              class_id: 3,
              section_id: 1,
              school_id: school.id,
              day_of_week: "mon",
              start_hour: 10,
              start_min: 0,
              end_hour: 10,
              end_min: 45,
              teacher_id: teacher.id,
            },
            {
              class_id: 3,
              section_id: 1,
              school_id: school.id,
              day_of_week: "tue",
              start_hour: 10,
              start_min: 0,
              end_hour: 10,
              end_min: 45,
              teacher_id: teacher.id,
            },
            {
              class_id: 3,
              section_id: 1,
              school_id: school.id,
              day_of_week: "wed",
              start_hour: 10,
              start_min: 0,
              end_hour: 10,
              end_min: 45,
              teacher_id: teacher.id,
            },
            {
              class_id: 3,
              section_id: 1,
              school_id: school.id,
              day_of_week: "thu",
              start_hour: 10,
              start_min: 0,
              end_hour: 10,
              end_min: 45,
              teacher_id: teacher.id,
            },
            {
              class_id: 3,
              section_id: 1,
              school_id: school.id,
              day_of_week: "fri",
              start_hour: 10,
              start_min: 0,
              end_hour: 10,
              end_min: 45,
              teacher_id: teacher.id,
            },
            {
              class_id: 3,
              section_id: 1,
              school_id: school.id,
              day_of_week: "sat",
              start_hour: 10,
              start_min: 0,
              end_hour: 10,
              end_min: 45,
              teacher_id: teacher.id,
            },
          ],
          skipDuplicates: true,
        },
      },
    },
  });

  await prisma.subject.create({
    data: {
      name: "Assamese",
      school_id: school.id,
      Periods: {
        createMany: {
          data: [
            {
              class_id: 3,
              section_id: 1,
              school_id: school.id,
              day_of_week: "wed",
              start_hour: 10,
              start_min: 45,
              end_hour: 11,
              end_min: 30,
              teacher_id: teacher.id,
            },
          ],
          skipDuplicates: true,
        },
      },
    },
  });

  await prisma.subject.create({
    data: {
      name: "Hindi",
      school_id: school.id,
    },
  });

  await prisma.subject.create({
    data: {
      name: "Social Science",
      school_id: school.id,
    },
  });

  await prisma.subject.create({
    data: {
      name: "Physical Education",
      school_id: school.id,
    },
  });

  await prisma.subject.create({
    data: {
      name: "Art",
      school_id: school.id,
    },
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
