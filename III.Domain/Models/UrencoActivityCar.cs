using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("URENCO_ACTIVITY_CAR")]
    public class UrencoActivityCar
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string ActCode { get; set; }
        public string CarTypeCode { get; set; }
        public string Priority { get; set; } 
        public bool IsDeleted { get; set; }
      
    }
}