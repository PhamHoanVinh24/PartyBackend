using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Globalization;

namespace ESEIM.Models
{
    [Table("LMS_TASK")]
    public class LmsTask
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Key, StringLength(100)]
        public string LmsTaskCode { get; set; }

        [StringLength(255)]
        public string LmsTaskName { get; set; }

        [StringLength(100)]
        public string ListCode { get; set; }
        public string BackgroundColor { get; set; }
        public string BackgroundImage { get; set; }

        public string Description { get; set; }

        [StringLength(255)]
        public string LmsTaskType { get; set; }

        [StringLength(255)]
        public string Status { get; set; }

        public DateTime BeginTime { get; set; }

        public DateTime? EndTime { get; set; }
        
        public DateTime CreatedDate { get; set; }

        [StringLength(255)]
        public string CreatedBy { get; set; }

        public bool IsDeleted { get; set; }

        public string LmsUserList
        {
            get
            {
                return JsonConvert.SerializeObject(ListUsers);
            }
            set
            {
                ListUsers = string.IsNullOrEmpty(value)
                ? new List<LmsTaskUser>()
                : JsonConvert.DeserializeObject<List<LmsTaskUser>>(value);
            }
        }
        [NotMapped]

        public List<LmsTaskUser> ListUsers { get; set; }
        
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public string LockShare { get; set; }

        public string LmsTaskNext { get; set; }

        public string LmsItemList
        {
            get
            {
                return JsonConvert.SerializeObject(ListItems);
            }
            set
            {
                ListItems = string.IsNullOrEmpty(value)
                ? new List<LmsTaskItem>()
                : JsonConvert.DeserializeObject<List<LmsTaskItem>>(value);
            }
        }
        [NotMapped]

        public List<LmsTaskItem> ListItems { get; set; }
    }
    //[{"Id":"95876ecb-0a05-4d44-b9cd-de5185e2b3c5","TrainingType":"VIEW_LECTURE","ItemCode":"VL10_001","ItemName":"CHUYỂN ĐỘNG THẲNG BIẾN ĐỔI ĐỀU","SubjectCode":"PHYSIC-101","SubjectName":"Vật lý"},{ "Id":"1a6968d2-ff9f-460a-afd1-f749573bcf1f","TrainingType":"DO_EXCERCISE","ItemCode":"VL10_001","ItemName":"CHUYỂN ĐỘNG THẲNG BIẾN ĐỔI ĐỀU","SubjectCode":"PHYSIC-101","SubjectName":"Vật lý"},{ "Id":"c6d08893-19dd-43d9-aea7-362d50713e2a","TrainingType":"DO_TEST","ItemCode":"EXAM-001","ItemName":"Bài thi 001","SubjectCode":"","SubjectName":"Vật lý"},{ "Id":"d924a414-d9fe-451b-b6de-976da9c9adc1","TrainingType":"DO_EXCERCISE","ItemCode":"VL10_002","ItemName":"CHUYỂN ĐỘNG TRÒN ĐỀU( tiết 1)","SubjectCode":"PHYSIC-101","SubjectName":"Vật lý"},{ "Id":"73bddf5e-aa2b-4421-944b-237fd917b7d4","TrainingType":"DO_EXCERCISE","ItemCode":"VL10_003","ItemName":"SỰ RƠI TỰ DO","SubjectCode":"PHYSIC-101","SubjectName":"Vật lý"},{ "Id":"a0ad6c72-1d2a-46be-9a03-2a9d674b8b24","TrainingType":"DO_EXCERCISE","ItemCode":"VL10_004","ItemName":"Chuyển động của vật ném ngang","SubjectCode":"PHYSIC-101","SubjectName":"Vật lý"},{ "Id":"399864b3-c024-4570-a7c1-531846fdbe0f","TrainingType":"DO_EXCERCISE","ItemCode":"VL10_005","ItemName":"TÍNH TƯƠNG ĐỐI CỦA CHUYỂN ĐỘNG . CÔNG THỨC CỘNG VẬN TỐC","SubjectCode":"PHYSIC-101","SubjectName":"Vật lý"}]
    public class LmsTaskItem
    {
        public string Id { get; set; }
        public string TrainingType { get; set; }
        public string ItemCode { get; set; }
        public string ItemName { get; set; }
        public string SubjectCode { get; set; }
        public string SubjectName { get; set; }
    }
    public class LmsTaskUser
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public DateTime BeginDate { get; set; }
        public DateTime EndDate { get; set; }
        public string DepartmentName { get; set; }
        public string GivenName { get; set; }
        public string Branch { get; set; }
        public string CreatedBy { get; set; }
        public string BeginTime
        {
            get
            {
                return BeginDate.ToString("dd/MM/yyyy");
            }
            set
            {
                BeginDate = DateTime.ParseExact(value, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            }
        }
        public string EndTime
        {
            get
            {
                return EndDate.ToString("dd/MM/yyyy");
            }
            set
            {
                EndDate = DateTime.ParseExact(value, "dd/MM/yyyy", CultureInfo.InvariantCulture); ;
            }
        }
    }
}
