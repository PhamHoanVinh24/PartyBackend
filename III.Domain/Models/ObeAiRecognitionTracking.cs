using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{ 
    [Table("OBE_AI_RECOGNITION_TRACKING")]
    public class ObeAiRecognitionTracking
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string FaceId { get; set; }

        public string ObjName { get; set; }
        public string ImgPath { get; set; }
        public string DeviceId { get; set; }
        public DateTime CreatedTime { get; set; }
    }
}
