
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("RM_SOS_MEDIA")]
    public class RmSOSMedia
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string Name { get; set; }

        public string Path { get; set; }

        public string Extension { get; set; }
        public double Size { get; set; }
        public string SosCode { get; set; }
        public string Code { get; set; }

    }
}
