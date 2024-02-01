using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("PARTY_ADMISSION_PROFILE")]
    public class PartyAdmissionProfile
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(maximumLength: 50)]
        public string CurrentName { get; set; }

        [StringLength(maximumLength: 50)]
        public string BirthName { get; set; }

        public int Gender { get; set; }

        [StringLength(maximumLength: 50)]
        public string Nation { get; set; }

        [StringLength(maximumLength: 50)]
        public string Religion { get; set; }

        public DateTime? Birthday { get; set; }

        [StringLength(maximumLength: 200)]
        public string PermanentResidence { get; set; }

        [StringLength(maximumLength: 50)]
        public string Phone { get; set; }

        [StringLength(maximumLength: 255)]
        public string Picture { get; set; }

        [StringLength(maximumLength: 100)]
        public string HomeTown { get; set; }

        [StringLength(maximumLength: 100)]
        public string PlaceBirth { get; set; }

        [StringLength(maximumLength: 50)]
        public string Job { get; set; }

        [StringLength(maximumLength: 250)]
        public string TemporaryAddress { get; set; }

        [StringLength(maximumLength: 50)]
        public string GeneralEducation { get; set; }

        [StringLength(maximumLength: 50)]
        public string JobEducation { get; set; }

        [StringLength(maximumLength: 50)]
        public string UnderPostGraduateEducation { get; set; }

        [StringLength(maximumLength: 50)]
        public string Degree { get; set; }

        [StringLength(maximumLength: 50)]
        public string PoliticalTheory { get; set; }

        [StringLength(maximumLength: 50)]
        public string ForeignLanguage { get; set; }

        [StringLength(maximumLength: 50)]
        public string ItDegree { get; set; }

        [StringLength(maximumLength: 50)]
        public string MinorityLanguages { get; set; }

        [StringLength(maximumLength: 50)]
        public string ResumeNumber { get; set; }

        //public DateTime CreatedTime { get; set; }
        public string SelfComment { get; set; }
        public string CreatedPlace { get; set; }
        public int UserCode { get; set; }
        public bool IsDeleted { get; set; }
        public string Status {  get; set; }
        public string Username { get; set; }
    }
}
