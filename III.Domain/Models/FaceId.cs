using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("FACE_FACE_ID")]
    public class FaceFaceId
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string FaceId { get; set; }

        public string Name { get; set; }

        public string ImgPath { get; set; }

        public DateTime CreatedTime { get; set; }

        

    }
}