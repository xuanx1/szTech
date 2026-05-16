// Real per-year + per-cluster + per-district counts derived from WIPO PatentScope
// result list. Query: FP:(shenzhen), 10,000 PCT records.
// Applicant→district attribution uses public HQ-location mapping in _build_corpus.js.
window.WIPO_CORPUS = {
  "source": "WIPO PatentScope FP:(shenzhen) result list, 10000 records",
  "records": 10000,
  "attributed": 7841,
  "year_fraction_window": {
    "2019": 0.1811,
    "2020": 0.1954,
    "2021": 0.16,
    "2022": 0.1402,
    "2023": 0.1929,
    "2024": 0.1303
  },
  "cluster_counts": {
    "ev": 335,
    "consumer": 1000,
    "biotech": 449,
    "telecom": 3900,
    "ai": 1732,
    "robotics": 187,
    "mfg": 93,
    "semi": 548,
    "urban": 141,
    "medtech": 291,
    "logistics": 78,
    "fintech": 179
  },
  "cluster_share": {
    "ev": 0.0375,
    "consumer": 0.1119,
    "biotech": 0.0503,
    "telecom": 0.4366,
    "ai": 0.1939,
    "robotics": 0.0209,
    "mfg": 0.0104,
    "semi": 0.0613,
    "urban": 0.0158,
    "medtech": 0.0326,
    "logistics": 0.0087,
    "fintech": 0.02
  },
  "cluster_by_year": {
    "ev": {
      "2000": 2,
      "2001": 1,
      "2002": 2,
      "2003": 3,
      "2004": 6,
      "2005": 5,
      "2006": 21,
      "2007": 24,
      "2008": 35,
      "2009": 27,
      "2010": 40,
      "2011": 63,
      "2012": 33,
      "2013": 25,
      "2014": 13,
      "2015": 5,
      "2016": 5,
      "2017": 7,
      "2018": 2,
      "2019": 2,
      "2020": 2,
      "2021": 1,
      "2022": 4,
      "2023": 5,
      "2024": 2
    },
    "consumer": {
      "1998": 1,
      "2000": 2,
      "2001": 2,
      "2002": 18,
      "2003": 9,
      "2004": 33,
      "2005": 27,
      "2006": 21,
      "2007": 39,
      "2008": 59,
      "2009": 60,
      "2010": 58,
      "2011": 74,
      "2012": 71,
      "2013": 52,
      "2014": 68,
      "2015": 60,
      "2016": 45,
      "2017": 32,
      "2018": 20,
      "2019": 81,
      "2020": 76,
      "2021": 37,
      "2022": 12,
      "2023": 17,
      "2024": 25,
      "2025": 1
    },
    "biotech": {
      "1994": 1,
      "1995": 1,
      "1998": 1,
      "1999": 1,
      "2002": 3,
      "2003": 11,
      "2004": 8,
      "2005": 10,
      "2006": 4,
      "2007": 6,
      "2008": 6,
      "2009": 20,
      "2010": 19,
      "2011": 71,
      "2012": 35,
      "2013": 5,
      "2014": 18,
      "2015": 14,
      "2016": 4,
      "2017": 11,
      "2018": 9,
      "2019": 24,
      "2020": 18,
      "2021": 34,
      "2022": 22,
      "2023": 26,
      "2024": 43,
      "2025": 24
    },
    "telecom": {
      "2000": 2,
      "2001": 25,
      "2002": 89,
      "2003": 165,
      "2004": 217,
      "2005": 169,
      "2006": 122,
      "2007": 175,
      "2008": 240,
      "2009": 369,
      "2010": 467,
      "2011": 436,
      "2012": 295,
      "2013": 278,
      "2014": 299,
      "2015": 133,
      "2016": 10,
      "2017": 34,
      "2018": 52,
      "2019": 57,
      "2020": 67,
      "2021": 38,
      "2022": 74,
      "2023": 61,
      "2024": 26
    },
    "ai": {
      "1999": 1,
      "2001": 2,
      "2002": 7,
      "2003": 11,
      "2004": 20,
      "2005": 15,
      "2006": 11,
      "2007": 22,
      "2008": 43,
      "2009": 78,
      "2010": 83,
      "2011": 90,
      "2012": 94,
      "2013": 360,
      "2014": 368,
      "2015": 184,
      "2016": 46,
      "2017": 51,
      "2018": 31,
      "2019": 33,
      "2020": 40,
      "2021": 57,
      "2022": 30,
      "2023": 30,
      "2024": 24,
      "2025": 1
    },
    "robotics": {
      "2001": 2,
      "2004": 1,
      "2005": 3,
      "2006": 1,
      "2008": 3,
      "2009": 1,
      "2010": 2,
      "2011": 3,
      "2012": 6,
      "2013": 3,
      "2014": 25,
      "2015": 36,
      "2016": 65,
      "2017": 20,
      "2018": 6,
      "2020": 4,
      "2022": 2,
      "2023": 1,
      "2024": 3
    },
    "mfg": {
      "1994": 1,
      "2001": 2,
      "2005": 3,
      "2006": 3,
      "2007": 4,
      "2009": 7,
      "2010": 8,
      "2011": 17,
      "2012": 14,
      "2013": 2,
      "2014": 4,
      "2016": 2,
      "2017": 2,
      "2018": 4,
      "2019": 2,
      "2020": 2,
      "2021": 4,
      "2022": 1,
      "2023": 4,
      "2024": 7
    },
    "semi": {
      "2003": 1,
      "2006": 4,
      "2007": 5,
      "2008": 15,
      "2009": 23,
      "2010": 48,
      "2011": 178,
      "2012": 142,
      "2013": 12,
      "2014": 4,
      "2015": 4,
      "2016": 15,
      "2017": 19,
      "2018": 13,
      "2019": 16,
      "2020": 12,
      "2021": 6,
      "2022": 11,
      "2023": 12,
      "2024": 7,
      "2025": 1
    },
    "urban": {
      "2001": 1,
      "2002": 2,
      "2003": 2,
      "2004": 7,
      "2005": 1,
      "2007": 1,
      "2008": 6,
      "2009": 5,
      "2010": 7,
      "2011": 10,
      "2012": 6,
      "2013": 4,
      "2014": 7,
      "2015": 13,
      "2016": 3,
      "2017": 25,
      "2018": 6,
      "2019": 4,
      "2020": 8,
      "2021": 4,
      "2022": 8,
      "2023": 4,
      "2024": 6,
      "2025": 1
    },
    "medtech": {
      "1994": 2,
      "2003": 3,
      "2005": 4,
      "2007": 1,
      "2008": 5,
      "2009": 11,
      "2010": 8,
      "2011": 26,
      "2012": 20,
      "2013": 5,
      "2014": 8,
      "2015": 26,
      "2016": 18,
      "2017": 24,
      "2018": 15,
      "2019": 16,
      "2020": 20,
      "2021": 22,
      "2022": 14,
      "2023": 13,
      "2024": 15,
      "2025": 15
    },
    "logistics": {
      "1999": 1,
      "2001": 1,
      "2003": 1,
      "2004": 1,
      "2005": 1,
      "2006": 1,
      "2008": 1,
      "2009": 2,
      "2011": 3,
      "2012": 51,
      "2013": 5,
      "2017": 1,
      "2020": 2,
      "2021": 1,
      "2022": 2,
      "2023": 1,
      "2024": 3
    },
    "fintech": {
      "2003": 1,
      "2007": 2,
      "2008": 6,
      "2009": 2,
      "2010": 2,
      "2012": 7,
      "2013": 21,
      "2014": 68,
      "2015": 24,
      "2016": 4,
      "2017": 4,
      "2019": 15,
      "2020": 14,
      "2022": 2,
      "2023": 5,
      "2024": 2
    }
  },
  "migration": {
    "ev": {
      "2000": {
        "pingshan": 1
      },
      "2002": {
        "pingshan": 1
      },
      "2004": {
        "pingshan": 4
      },
      "2005": {
        "longgang": 1,
        "pingshan": 2
      },
      "2006": {
        "pingshan": 18
      },
      "2007": {
        "pingshan": 15,
        "longgang": 2
      },
      "2008": {
        "pingshan": 33
      },
      "2009": {
        "pingshan": 18,
        "longgang": 1
      },
      "2010": {
        "pingshan": 24,
        "longgang": 1,
        "nanshan": 2,
        "baoan": 1
      },
      "2011": {
        "pingshan": 36,
        "baoan": 3,
        "nanshan": 5,
        "longgang": 1
      },
      "2012": {
        "pingshan": 24,
        "baoan": 4,
        "nanshan": 1
      },
      "2013": {
        "pingshan": 21,
        "nanshan": 3
      },
      "2014": {
        "pingshan": 5,
        "nanshan": 8
      },
      "2015": {
        "nanshan": 4
      },
      "2016": {
        "nanshan": 3
      },
      "2017": {
        "nanshan": 1
      },
      "2023": {
        "baoan": 2
      }
    },
    "consumer": {
      "2000": {
        "longgang": 1
      },
      "2001": {
        "longgang": 2
      },
      "2002": {
        "longgang": 15,
        "nanshan": 1
      },
      "2003": {
        "longgang": 4,
        "nanshan": 3
      },
      "2004": {
        "longgang": 22,
        "nanshan": 8
      },
      "2005": {
        "longgang": 20,
        "nanshan": 4
      },
      "2006": {
        "pingshan": 1,
        "longgang": 15,
        "nanshan": 4
      },
      "2007": {
        "pingshan": 5,
        "longgang": 17,
        "nanshan": 3,
        "baoan": 10
      },
      "2008": {
        "pingshan": 1,
        "longgang": 32,
        "nanshan": 5,
        "baoan": 15
      },
      "2009": {
        "pingshan": 4,
        "longgang": 33,
        "nanshan": 4,
        "baoan": 8
      },
      "2010": {
        "pingshan": 3,
        "longgang": 25,
        "nanshan": 14,
        "baoan": 1
      },
      "2011": {
        "pingshan": 2,
        "nanshan": 28,
        "longgang": 13,
        "baoan": 10
      },
      "2012": {
        "pingshan": 3,
        "nanshan": 22,
        "longgang": 16,
        "baoan": 17
      },
      "2013": {
        "pingshan": 1,
        "nanshan": 43,
        "baoan": 2
      },
      "2014": {
        "longgang": 2,
        "baoan": 3,
        "nanshan": 62
      },
      "2015": {
        "nanshan": 56,
        "baoan": 2
      },
      "2016": {
        "nanshan": 21,
        "longgang": 13,
        "baoan": 6
      },
      "2017": {
        "nanshan": 13,
        "longgang": 15
      },
      "2018": {
        "longgang": 16,
        "nanshan": 2
      },
      "2019": {
        "baoan": 38,
        "longgang": 32,
        "nanshan": 5
      },
      "2020": {
        "nanshan": 3,
        "longgang": 58
      },
      "2021": {
        "baoan": 1,
        "longgang": 25,
        "nanshan": 8
      },
      "2022": {
        "nanshan": 5,
        "longgang": 7
      },
      "2023": {
        "baoan": 14,
        "nanshan": 1
      },
      "2024": {
        "baoan": 19
      }
    },
    "biotech": {
      "2009": {
        "baoan": 1
      },
      "2010": {
        "yantian": 9
      },
      "2011": {
        "yantian": 54,
        "baoan": 1
      },
      "2012": {
        "yantian": 27
      },
      "2013": {
        "yantian": 1
      },
      "2014": {
        "yantian": 14
      },
      "2015": {
        "yantian": 8,
        "nanshan": 1
      },
      "2017": {
        "yantian": 2,
        "nanshan": 2
      },
      "2018": {
        "nanshan": 2
      },
      "2019": {
        "yantian": 1,
        "nanshan": 2
      },
      "2020": {
        "nanshan": 2,
        "yantian": 5
      },
      "2021": {
        "nanshan": 2,
        "yantian": 2
      },
      "2022": {
        "nanshan": 1
      },
      "2024": {
        "nanshan": 1
      },
      "2025": {
        "nanshan": 2
      }
    },
    "telecom": {
      "2001": {
        "longgang": 22,
        "nanshan": 2
      },
      "2002": {
        "longgang": 73,
        "nanshan": 11
      },
      "2003": {
        "longgang": 107,
        "nanshan": 40
      },
      "2004": {
        "longgang": 153,
        "nanshan": 48
      },
      "2005": {
        "longgang": 141,
        "nanshan": 25
      },
      "2006": {
        "longgang": 81,
        "nanshan": 36
      },
      "2007": {
        "longgang": 124,
        "nanshan": 39,
        "baoan": 1
      },
      "2008": {
        "longgang": 176,
        "nanshan": 52,
        "baoan": 1
      },
      "2009": {
        "nanshan": 115,
        "longgang": 245,
        "pingshan": 1
      },
      "2010": {
        "longgang": 139,
        "nanshan": 326
      },
      "2011": {
        "nanshan": 278,
        "longgang": 135,
        "yantian": 1
      },
      "2012": {
        "nanshan": 197,
        "longgang": 89
      },
      "2013": {
        "pingshan": 1,
        "nanshan": 276
      },
      "2014": {
        "nanshan": 295,
        "baoan": 1
      },
      "2015": {
        "nanshan": 130,
        "baoan": 1
      },
      "2016": {
        "longgang": 6,
        "nanshan": 2,
        "baoan": 1
      },
      "2017": {
        "nanshan": 30,
        "longgang": 4
      },
      "2018": {
        "nanshan": 50,
        "longgang": 2
      },
      "2019": {
        "nanshan": 50
      },
      "2020": {
        "nanshan": 62,
        "longgang": 4
      },
      "2021": {
        "nanshan": 22,
        "longhua": 1,
        "longgang": 7
      },
      "2022": {
        "baoan": 62,
        "nanshan": 6,
        "longgang": 3
      },
      "2023": {
        "baoan": 61
      },
      "2024": {
        "baoan": 24,
        "longgang": 2
      }
    },
    "ai": {
      "2001": {
        "nanshan": 1,
        "longgang": 1
      },
      "2002": {
        "longgang": 4,
        "nanshan": 1
      },
      "2003": {
        "nanshan": 2,
        "longgang": 3
      },
      "2004": {
        "longgang": 3,
        "nanshan": 5
      },
      "2005": {
        "longgang": 6,
        "nanshan": 6
      },
      "2006": {
        "longgang": 4,
        "nanshan": 3,
        "baoan": 1
      },
      "2007": {
        "longgang": 11,
        "pingshan": 2,
        "nanshan": 3
      },
      "2008": {
        "nanshan": 13,
        "longgang": 18,
        "baoan": 1
      },
      "2009": {
        "nanshan": 17,
        "pingshan": 1,
        "longgang": 38,
        "baoan": 3
      },
      "2010": {
        "pingshan": 8,
        "longgang": 26,
        "nanshan": 33,
        "yantian": 1,
        "baoan": 3
      },
      "2011": {
        "pingshan": 4,
        "nanshan": 39,
        "longgang": 19,
        "yantian": 4
      },
      "2012": {
        "pingshan": 13,
        "nanshan": 58,
        "longgang": 5,
        "yantian": 6,
        "baoan": 4
      },
      "2013": {
        "pingshan": 1,
        "nanshan": 353,
        "futian": 1
      },
      "2014": {
        "pingshan": 2,
        "nanshan": 358,
        "longgang": 1
      },
      "2015": {
        "nanshan": 168,
        "longgang": 1
      },
      "2016": {
        "nanshan": 30,
        "longgang": 8,
        "baoan": 2
      },
      "2017": {
        "nanshan": 26,
        "longgang": 9
      },
      "2018": {
        "nanshan": 15,
        "longgang": 7
      },
      "2019": {
        "nanshan": 21,
        "longgang": 5
      },
      "2020": {
        "nanshan": 16,
        "longgang": 14
      },
      "2021": {
        "futian": 11,
        "longgang": 27,
        "nanshan": 11
      },
      "2022": {
        "futian": 5,
        "baoan": 3,
        "nanshan": 2,
        "longgang": 7
      },
      "2023": {
        "baoan": 19,
        "nanshan": 4
      },
      "2024": {
        "baoan": 14,
        "longgang": 2,
        "nanshan": 1
      }
    },
    "robotics": {
      "2006": {
        "pingshan": 1
      },
      "2008": {
        "pingshan": 1
      },
      "2010": {
        "nanshan": 1
      },
      "2011": {
        "pingshan": 1
      },
      "2012": {
        "pingshan": 1,
        "baoan": 4
      },
      "2013": {
        "pingshan": 1,
        "nanshan": 1
      },
      "2014": {
        "pingshan": 1,
        "nanshan": 23
      },
      "2015": {
        "nanshan": 36
      },
      "2016": {
        "nanshan": 63
      },
      "2017": {
        "nanshan": 20
      },
      "2024": {
        "nanshan": 1
      }
    },
    "mfg": {
      "2006": {
        "pingshan": 1
      },
      "2007": {
        "baoan": 1,
        "pingshan": 1
      },
      "2009": {
        "pingshan": 6
      },
      "2010": {
        "pingshan": 1,
        "baoan": 1
      },
      "2011": {
        "pingshan": 2,
        "baoan": 1,
        "nanshan": 4
      },
      "2012": {
        "pingshan": 7,
        "baoan": 4
      },
      "2013": {
        "pingshan": 1
      },
      "2014": {
        "pingshan": 2
      },
      "2017": {
        "nanshan": 1
      },
      "2020": {
        "longhua": 1
      },
      "2021": {
        "nanshan": 1
      },
      "2023": {
        "baoan": 1
      }
    },
    "semi": {
      "2003": {
        "nanshan": 1
      },
      "2006": {
        "baoan": 4
      },
      "2007": {
        "longgang": 1,
        "pingshan": 1
      },
      "2008": {
        "pingshan": 3,
        "baoan": 3
      },
      "2009": {
        "nanshan": 1,
        "pingshan": 2,
        "baoan": 10,
        "longgang": 1
      },
      "2010": {
        "pingshan": 15,
        "longgang": 3,
        "baoan": 12,
        "nanshan": 1
      },
      "2011": {
        "pingshan": 13,
        "nanshan": 13,
        "baoan": 122,
        "longgang": 6
      },
      "2012": {
        "pingshan": 6,
        "baoan": 108,
        "longgang": 4,
        "nanshan": 4
      },
      "2013": {
        "pingshan": 8,
        "baoan": 2
      },
      "2014": {
        "pingshan": 2,
        "baoan": 1
      },
      "2015": {
        "nanshan": 4
      },
      "2016": {
        "nanshan": 5
      },
      "2017": {
        "nanshan": 15
      },
      "2018": {
        "nanshan": 5
      },
      "2019": {
        "baoan": 4,
        "nanshan": 4,
        "longgang": 2
      },
      "2020": {
        "nanshan": 3
      },
      "2021": {
        "longgang": 1,
        "nanshan": 1
      },
      "2022": {
        "nanshan": 4
      },
      "2023": {
        "baoan": 1,
        "nanshan": 2
      },
      "2024": {
        "longgang": 2
      }
    },
    "logistics": {
      "2009": {
        "longgang": 1
      },
      "2012": {
        "pingshan": 1,
        "baoan": 48
      },
      "2013": {
        "baoan": 4
      },
      "2023": {
        "baoan": 1
      }
    },
    "urban": {
      "2001": {
        "longgang": 1
      },
      "2002": {
        "longgang": 1
      },
      "2003": {
        "nanshan": 1,
        "longgang": 1
      },
      "2004": {
        "longgang": 6
      },
      "2005": {
        "longgang": 1
      },
      "2008": {
        "nanshan": 1
      },
      "2009": {
        "nanshan": 2
      },
      "2011": {
        "nanshan": 2
      },
      "2012": {
        "baoan": 3
      },
      "2013": {
        "pingshan": 1,
        "nanshan": 2
      },
      "2014": {
        "nanshan": 6
      },
      "2015": {
        "nanshan": 11
      },
      "2016": {
        "nanshan": 2
      },
      "2017": {
        "nanshan": 20
      },
      "2018": {
        "nanshan": 2
      },
      "2020": {
        "nanshan": 2
      },
      "2021": {
        "nanshan": 1
      },
      "2022": {
        "baoan": 1
      },
      "2023": {
        "baoan": 1
      },
      "2024": {
        "baoan": 2
      }
    },
    "medtech": {
      "2010": {
        "futian": 1,
        "nanshan": 1
      },
      "2011": {
        "yantian": 3,
        "nanshan": 3,
        "futian": 1
      },
      "2012": {
        "baoan": 7,
        "nanshan": 1,
        "futian": 2
      },
      "2013": {
        "pingshan": 1,
        "futian": 1
      },
      "2014": {
        "yantian": 1,
        "nanshan": 1
      },
      "2015": {
        "nanshan": 7,
        "futian": 3,
        "yantian": 2
      },
      "2016": {
        "nanshan": 9
      },
      "2017": {
        "nanshan": 8
      },
      "2018": {
        "nanshan": 9
      },
      "2019": {
        "nanshan": 10
      },
      "2020": {
        "nanshan": 13,
        "yantian": 1,
        "longgang": 2
      },
      "2021": {
        "nanshan": 16
      },
      "2022": {
        "futian": 1,
        "nanshan": 7
      },
      "2023": {
        "nanshan": 6
      }
    },
    "fintech": {
      "2003": {
        "nanshan": 1
      },
      "2007": {
        "longgang": 2
      },
      "2008": {
        "nanshan": 2,
        "longgang": 3
      },
      "2009": {
        "nanshan": 1
      },
      "2010": {
        "nanshan": 2
      },
      "2012": {
        "baoan": 1,
        "nanshan": 3
      },
      "2013": {
        "nanshan": 21
      },
      "2014": {
        "nanshan": 66
      },
      "2015": {
        "nanshan": 15
      },
      "2017": {
        "nanshan": 1,
        "longgang": 1
      },
      "2020": {
        "longgang": 1
      },
      "2023": {
        "baoan": 4
      },
      "2024": {
        "baoan": 2
      }
    }
  },
  "migration_share": {
    "ev": {
      "2000": {
        "pingshan": 1
      },
      "2002": {
        "pingshan": 1
      },
      "2004": {
        "pingshan": 1
      },
      "2005": {
        "longgang": 0.3333,
        "pingshan": 0.6667
      },
      "2006": {
        "pingshan": 1
      },
      "2007": {
        "pingshan": 0.8824,
        "longgang": 0.1176
      },
      "2008": {
        "pingshan": 1
      },
      "2009": {
        "pingshan": 0.9474,
        "longgang": 0.0526
      },
      "2010": {
        "pingshan": 0.8571,
        "longgang": 0.0357,
        "nanshan": 0.0714,
        "baoan": 0.0357
      },
      "2011": {
        "pingshan": 0.8,
        "baoan": 0.0667,
        "nanshan": 0.1111,
        "longgang": 0.0222
      },
      "2012": {
        "pingshan": 0.8276,
        "baoan": 0.1379,
        "nanshan": 0.0345
      },
      "2013": {
        "pingshan": 0.875,
        "nanshan": 0.125
      },
      "2014": {
        "pingshan": 0.3846,
        "nanshan": 0.6154
      },
      "2015": {
        "nanshan": 1
      },
      "2016": {
        "nanshan": 1
      },
      "2017": {
        "nanshan": 1
      },
      "2023": {
        "baoan": 1
      }
    },
    "consumer": {
      "2000": {
        "longgang": 1
      },
      "2001": {
        "longgang": 1
      },
      "2002": {
        "longgang": 0.9375,
        "nanshan": 0.0625
      },
      "2003": {
        "longgang": 0.5714,
        "nanshan": 0.4286
      },
      "2004": {
        "longgang": 0.7333,
        "nanshan": 0.2667
      },
      "2005": {
        "longgang": 0.8333,
        "nanshan": 0.1667
      },
      "2006": {
        "pingshan": 0.05,
        "longgang": 0.75,
        "nanshan": 0.2
      },
      "2007": {
        "pingshan": 0.1429,
        "longgang": 0.4857,
        "nanshan": 0.0857,
        "baoan": 0.2857
      },
      "2008": {
        "pingshan": 0.0189,
        "longgang": 0.6038,
        "nanshan": 0.0943,
        "baoan": 0.283
      },
      "2009": {
        "pingshan": 0.0816,
        "longgang": 0.6735,
        "nanshan": 0.0816,
        "baoan": 0.1633
      },
      "2010": {
        "pingshan": 0.0698,
        "longgang": 0.5814,
        "nanshan": 0.3256,
        "baoan": 0.0233
      },
      "2011": {
        "pingshan": 0.0377,
        "nanshan": 0.5283,
        "longgang": 0.2453,
        "baoan": 0.1887
      },
      "2012": {
        "pingshan": 0.0517,
        "nanshan": 0.3793,
        "longgang": 0.2759,
        "baoan": 0.2931
      },
      "2013": {
        "pingshan": 0.0217,
        "nanshan": 0.9348,
        "baoan": 0.0435
      },
      "2014": {
        "longgang": 0.0299,
        "baoan": 0.0448,
        "nanshan": 0.9254
      },
      "2015": {
        "nanshan": 0.9655,
        "baoan": 0.0345
      },
      "2016": {
        "nanshan": 0.525,
        "longgang": 0.325,
        "baoan": 0.15
      },
      "2017": {
        "nanshan": 0.4643,
        "longgang": 0.5357
      },
      "2018": {
        "longgang": 0.8889,
        "nanshan": 0.1111
      },
      "2019": {
        "baoan": 0.5067,
        "longgang": 0.4267,
        "nanshan": 0.0667
      },
      "2020": {
        "nanshan": 0.0492,
        "longgang": 0.9508
      },
      "2021": {
        "baoan": 0.0294,
        "longgang": 0.7353,
        "nanshan": 0.2353
      },
      "2022": {
        "nanshan": 0.4167,
        "longgang": 0.5833
      },
      "2023": {
        "baoan": 0.9333,
        "nanshan": 0.0667
      },
      "2024": {
        "baoan": 1
      }
    },
    "biotech": {
      "2009": {
        "baoan": 1
      },
      "2010": {
        "yantian": 1
      },
      "2011": {
        "yantian": 0.9818,
        "baoan": 0.0182
      },
      "2012": {
        "yantian": 1
      },
      "2013": {
        "yantian": 1
      },
      "2014": {
        "yantian": 1
      },
      "2015": {
        "yantian": 0.8889,
        "nanshan": 0.1111
      },
      "2017": {
        "yantian": 0.5,
        "nanshan": 0.5
      },
      "2018": {
        "nanshan": 1
      },
      "2019": {
        "yantian": 0.3333,
        "nanshan": 0.6667
      },
      "2020": {
        "nanshan": 0.2857,
        "yantian": 0.7143
      },
      "2021": {
        "nanshan": 0.5,
        "yantian": 0.5
      },
      "2022": {
        "nanshan": 1
      },
      "2024": {
        "nanshan": 1
      },
      "2025": {
        "nanshan": 1
      }
    },
    "telecom": {
      "2001": {
        "longgang": 0.9167,
        "nanshan": 0.0833
      },
      "2002": {
        "longgang": 0.869,
        "nanshan": 0.131
      },
      "2003": {
        "longgang": 0.7279,
        "nanshan": 0.2721
      },
      "2004": {
        "longgang": 0.7612,
        "nanshan": 0.2388
      },
      "2005": {
        "longgang": 0.8494,
        "nanshan": 0.1506
      },
      "2006": {
        "longgang": 0.6923,
        "nanshan": 0.3077
      },
      "2007": {
        "longgang": 0.7561,
        "nanshan": 0.2378,
        "baoan": 0.0061
      },
      "2008": {
        "longgang": 0.7686,
        "nanshan": 0.2271,
        "baoan": 0.0044
      },
      "2009": {
        "nanshan": 0.3186,
        "longgang": 0.6787,
        "pingshan": 0.0028
      },
      "2010": {
        "longgang": 0.2989,
        "nanshan": 0.7011
      },
      "2011": {
        "nanshan": 0.6715,
        "longgang": 0.3261,
        "yantian": 0.0024
      },
      "2012": {
        "nanshan": 0.6888,
        "longgang": 0.3112
      },
      "2013": {
        "pingshan": 0.0036,
        "nanshan": 0.9964
      },
      "2014": {
        "nanshan": 0.9966,
        "baoan": 0.0034
      },
      "2015": {
        "nanshan": 0.9924,
        "baoan": 0.0076
      },
      "2016": {
        "longgang": 0.6667,
        "nanshan": 0.2222,
        "baoan": 0.1111
      },
      "2017": {
        "nanshan": 0.8824,
        "longgang": 0.1176
      },
      "2018": {
        "nanshan": 0.9615,
        "longgang": 0.0385
      },
      "2019": {
        "nanshan": 1
      },
      "2020": {
        "nanshan": 0.9394,
        "longgang": 0.0606
      },
      "2021": {
        "nanshan": 0.7333,
        "longhua": 0.0333,
        "longgang": 0.2333
      },
      "2022": {
        "baoan": 0.8732,
        "nanshan": 0.0845,
        "longgang": 0.0423
      },
      "2023": {
        "baoan": 1
      },
      "2024": {
        "baoan": 0.9231,
        "longgang": 0.0769
      }
    },
    "ai": {
      "2001": {
        "nanshan": 0.5,
        "longgang": 0.5
      },
      "2002": {
        "longgang": 0.8,
        "nanshan": 0.2
      },
      "2003": {
        "nanshan": 0.4,
        "longgang": 0.6
      },
      "2004": {
        "longgang": 0.375,
        "nanshan": 0.625
      },
      "2005": {
        "longgang": 0.5,
        "nanshan": 0.5
      },
      "2006": {
        "longgang": 0.5,
        "nanshan": 0.375,
        "baoan": 0.125
      },
      "2007": {
        "longgang": 0.6875,
        "pingshan": 0.125,
        "nanshan": 0.1875
      },
      "2008": {
        "nanshan": 0.4063,
        "longgang": 0.5625,
        "baoan": 0.0313
      },
      "2009": {
        "nanshan": 0.2881,
        "pingshan": 0.0169,
        "longgang": 0.6441,
        "baoan": 0.0508
      },
      "2010": {
        "pingshan": 0.1127,
        "longgang": 0.3662,
        "nanshan": 0.4648,
        "yantian": 0.0141,
        "baoan": 0.0423
      },
      "2011": {
        "pingshan": 0.0606,
        "nanshan": 0.5909,
        "longgang": 0.2879,
        "yantian": 0.0606
      },
      "2012": {
        "pingshan": 0.1512,
        "nanshan": 0.6744,
        "longgang": 0.0581,
        "yantian": 0.0698,
        "baoan": 0.0465
      },
      "2013": {
        "pingshan": 0.0028,
        "nanshan": 0.9944,
        "futian": 0.0028
      },
      "2014": {
        "pingshan": 0.0055,
        "nanshan": 0.9917,
        "longgang": 0.0028
      },
      "2015": {
        "nanshan": 0.9941,
        "longgang": 0.0059
      },
      "2016": {
        "nanshan": 0.75,
        "longgang": 0.2,
        "baoan": 0.05
      },
      "2017": {
        "nanshan": 0.7429,
        "longgang": 0.2571
      },
      "2018": {
        "nanshan": 0.6818,
        "longgang": 0.3182
      },
      "2019": {
        "nanshan": 0.8077,
        "longgang": 0.1923
      },
      "2020": {
        "nanshan": 0.5333,
        "longgang": 0.4667
      },
      "2021": {
        "futian": 0.2245,
        "longgang": 0.551,
        "nanshan": 0.2245
      },
      "2022": {
        "futian": 0.2941,
        "baoan": 0.1765,
        "nanshan": 0.1176,
        "longgang": 0.4118
      },
      "2023": {
        "baoan": 0.8261,
        "nanshan": 0.1739
      },
      "2024": {
        "baoan": 0.8235,
        "longgang": 0.1176,
        "nanshan": 0.0588
      }
    },
    "robotics": {
      "2006": {
        "pingshan": 1
      },
      "2008": {
        "pingshan": 1
      },
      "2010": {
        "nanshan": 1
      },
      "2011": {
        "pingshan": 1
      },
      "2012": {
        "pingshan": 0.2,
        "baoan": 0.8
      },
      "2013": {
        "pingshan": 0.5,
        "nanshan": 0.5
      },
      "2014": {
        "pingshan": 0.0417,
        "nanshan": 0.9583
      },
      "2015": {
        "nanshan": 1
      },
      "2016": {
        "nanshan": 1
      },
      "2017": {
        "nanshan": 1
      },
      "2024": {
        "nanshan": 1
      }
    },
    "mfg": {
      "2006": {
        "pingshan": 1
      },
      "2007": {
        "baoan": 0.5,
        "pingshan": 0.5
      },
      "2009": {
        "pingshan": 1
      },
      "2010": {
        "pingshan": 0.5,
        "baoan": 0.5
      },
      "2011": {
        "pingshan": 0.2857,
        "baoan": 0.1429,
        "nanshan": 0.5714
      },
      "2012": {
        "pingshan": 0.6364,
        "baoan": 0.3636
      },
      "2013": {
        "pingshan": 1
      },
      "2014": {
        "pingshan": 1
      },
      "2017": {
        "nanshan": 1
      },
      "2020": {
        "longhua": 1
      },
      "2021": {
        "nanshan": 1
      },
      "2023": {
        "baoan": 1
      }
    },
    "semi": {
      "2003": {
        "nanshan": 1
      },
      "2006": {
        "baoan": 1
      },
      "2007": {
        "longgang": 0.5,
        "pingshan": 0.5
      },
      "2008": {
        "pingshan": 0.5,
        "baoan": 0.5
      },
      "2009": {
        "nanshan": 0.0714,
        "pingshan": 0.1429,
        "baoan": 0.7143,
        "longgang": 0.0714
      },
      "2010": {
        "pingshan": 0.4839,
        "longgang": 0.0968,
        "baoan": 0.3871,
        "nanshan": 0.0323
      },
      "2011": {
        "pingshan": 0.0844,
        "nanshan": 0.0844,
        "baoan": 0.7922,
        "longgang": 0.039
      },
      "2012": {
        "pingshan": 0.0492,
        "baoan": 0.8852,
        "longgang": 0.0328,
        "nanshan": 0.0328
      },
      "2013": {
        "pingshan": 0.8,
        "baoan": 0.2
      },
      "2014": {
        "pingshan": 0.6667,
        "baoan": 0.3333
      },
      "2015": {
        "nanshan": 1
      },
      "2016": {
        "nanshan": 1
      },
      "2017": {
        "nanshan": 1
      },
      "2018": {
        "nanshan": 1
      },
      "2019": {
        "baoan": 0.4,
        "nanshan": 0.4,
        "longgang": 0.2
      },
      "2020": {
        "nanshan": 1
      },
      "2021": {
        "longgang": 0.5,
        "nanshan": 0.5
      },
      "2022": {
        "nanshan": 1
      },
      "2023": {
        "baoan": 0.3333,
        "nanshan": 0.6667
      },
      "2024": {
        "longgang": 1
      }
    },
    "logistics": {
      "2009": {
        "longgang": 1
      },
      "2012": {
        "pingshan": 0.0204,
        "baoan": 0.9796
      },
      "2013": {
        "baoan": 1
      },
      "2023": {
        "baoan": 1
      }
    },
    "urban": {
      "2001": {
        "longgang": 1
      },
      "2002": {
        "longgang": 1
      },
      "2003": {
        "nanshan": 0.5,
        "longgang": 0.5
      },
      "2004": {
        "longgang": 1
      },
      "2005": {
        "longgang": 1
      },
      "2008": {
        "nanshan": 1
      },
      "2009": {
        "nanshan": 1
      },
      "2011": {
        "nanshan": 1
      },
      "2012": {
        "baoan": 1
      },
      "2013": {
        "pingshan": 0.3333,
        "nanshan": 0.6667
      },
      "2014": {
        "nanshan": 1
      },
      "2015": {
        "nanshan": 1
      },
      "2016": {
        "nanshan": 1
      },
      "2017": {
        "nanshan": 1
      },
      "2018": {
        "nanshan": 1
      },
      "2020": {
        "nanshan": 1
      },
      "2021": {
        "nanshan": 1
      },
      "2022": {
        "baoan": 1
      },
      "2023": {
        "baoan": 1
      },
      "2024": {
        "baoan": 1
      }
    },
    "medtech": {
      "2010": {
        "futian": 0.5,
        "nanshan": 0.5
      },
      "2011": {
        "yantian": 0.4286,
        "nanshan": 0.4286,
        "futian": 0.1429
      },
      "2012": {
        "baoan": 0.7,
        "nanshan": 0.1,
        "futian": 0.2
      },
      "2013": {
        "pingshan": 0.5,
        "futian": 0.5
      },
      "2014": {
        "yantian": 0.5,
        "nanshan": 0.5
      },
      "2015": {
        "nanshan": 0.5833,
        "futian": 0.25,
        "yantian": 0.1667
      },
      "2016": {
        "nanshan": 1
      },
      "2017": {
        "nanshan": 1
      },
      "2018": {
        "nanshan": 1
      },
      "2019": {
        "nanshan": 1
      },
      "2020": {
        "nanshan": 0.8125,
        "yantian": 0.0625,
        "longgang": 0.125
      },
      "2021": {
        "nanshan": 1
      },
      "2022": {
        "futian": 0.125,
        "nanshan": 0.875
      },
      "2023": {
        "nanshan": 1
      }
    },
    "fintech": {
      "2003": {
        "nanshan": 1
      },
      "2007": {
        "longgang": 1
      },
      "2008": {
        "nanshan": 0.4,
        "longgang": 0.6
      },
      "2009": {
        "nanshan": 1
      },
      "2010": {
        "nanshan": 1
      },
      "2012": {
        "baoan": 0.25,
        "nanshan": 0.75
      },
      "2013": {
        "nanshan": 1
      },
      "2014": {
        "nanshan": 1
      },
      "2015": {
        "nanshan": 1
      },
      "2017": {
        "nanshan": 0.5,
        "longgang": 0.5
      },
      "2020": {
        "longgang": 1
      },
      "2023": {
        "baoan": 1
      },
      "2024": {
        "baoan": 1
      }
    }
  },
  "assignees_by_district": {
    "pingshan": [
      {
        "name": "BYD COMPANY LIMITED",
        "district": "pingshan",
        "cluster": "ev",
        "n": 219
      },
      {
        "name": "SHENZHEN BYD AUTO R&D COMPANY LIMITED",
        "district": "pingshan",
        "cluster": "ev",
        "n": 179
      },
      {
        "name": "SHENZHEN BYD AUTO R & D COMPANY LIMITED",
        "district": "pingshan",
        "cluster": "ev",
        "n": 34
      },
      {
        "name": "BYD BATTERY CO., LTD.",
        "district": "pingshan",
        "cluster": "ev",
        "n": 1
      }
    ],
    "longgang": [
      {
        "name": "HUAWEI TECHNOLOGIES CO., LTD.",
        "district": "longgang",
        "cluster": "telecom",
        "n": 2002
      },
      {
        "name": "HUAWEI DEVICE CO., LTD.",
        "district": "longgang",
        "cluster": "telecom",
        "n": 76
      },
      {
        "name": "HUAWEI TECHNOLOGIES CO.,LTD",
        "district": "longgang",
        "cluster": "telecom",
        "n": 18
      },
      {
        "name": "SHENZHEN HUAWEI COMMUNICATION TECHNOLOGIES CO. , LTD.",
        "district": "longgang",
        "cluster": "telecom",
        "n": 7
      },
      {
        "name": "SHENZHEN ROYOLE TECHNOLOGIES CO. LTD.",
        "district": "longgang",
        "cluster": "semi",
        "n": 5
      },
      {
        "name": "HUAWEI DIGITAL POWER TECHNOLOGIES CO., LTD.",
        "district": "longgang",
        "cluster": null,
        "n": 4
      }
    ],
    "yantian": [
      {
        "name": "BGI SHENZHEN CO., LIMITED",
        "district": "yantian",
        "cluster": "biotech",
        "n": 71
      },
      {
        "name": "BGI SHENZHEN",
        "district": "yantian",
        "cluster": "biotech",
        "n": 19
      },
      {
        "name": "BGI TECH SOLUTIONS CO., LTD",
        "district": "yantian",
        "cluster": "biotech",
        "n": 18
      },
      {
        "name": "BGI DIAGNOSIS CO., LTD.",
        "district": "yantian",
        "cluster": "biotech",
        "n": 9
      },
      {
        "name": "BGI SHENZHEN CO., LTD.",
        "district": "yantian",
        "cluster": "biotech",
        "n": 8
      },
      {
        "name": "BGI SHENZHEN CO.,LIMITED",
        "district": "yantian",
        "cluster": "biotech",
        "n": 3
      }
    ],
    "nanshan": [
      {
        "name": "TENCENT TECHNOLOGY (SHENZHEN) COMPANY LIMITED",
        "district": "nanshan",
        "cluster": "ai",
        "n": 1876
      },
      {
        "name": "ZTE CORPORATION",
        "district": "nanshan",
        "cluster": "telecom",
        "n": 1218
      },
      {
        "name": "SZ DJI TECHNOLOGY CO., LTD.",
        "district": "nanshan",
        "cluster": "robotics",
        "n": 321
      },
      {
        "name": "SHENZHEN XPECTVISION TECHNOLOGY CO., LTD.",
        "district": "nanshan",
        "cluster": "medtech",
        "n": 173
      },
      {
        "name": "JRD COMMUNICATION (SHENZHEN) LTD.",
        "district": "nanshan",
        "cluster": "telecom",
        "n": 166
      },
      {
        "name": "SHENZHEN GOODIX TECHNOLOGY CO., LTD.",
        "district": "nanshan",
        "cluster": "ai",
        "n": 158
      }
    ],
    "baoan": [
      {
        "name": "SHENZHEN CHINA STAR OPTOELECTRONICS TECHNOLOGY CO., LTD.",
        "district": "baoan",
        "cluster": "semi",
        "n": 304
      },
      {
        "name": "SHENZHEN TCL NEW TECHNOLOGY CO., LTD",
        "district": "baoan",
        "cluster": "telecom",
        "n": 154
      },
      {
        "name": "OCEAN'S KING LIGHTING SCIENCE & TECHNOLOGY CO., LTD.",
        "district": "baoan",
        "cluster": "semi",
        "n": 86
      },
      {
        "name": "SHENZHEN OCEAN'S KING LIGHTING ENGINEERING CO., LTD.",
        "district": "baoan",
        "cluster": "ai",
        "n": 74
      },
      {
        "name": "AAC ACOUSTIC TECHNOLOGIES (SHENZHEN) CO., LTD.",
        "district": "baoan",
        "cluster": "consumer",
        "n": 48
      },
      {
        "name": "SHENZHEN TCL NEW TECHNOLOGY LTD",
        "district": "baoan",
        "cluster": "consumer",
        "n": 46
      }
    ],
    "futian": [
      {
        "name": "PING AN TECHNOLOGY (SHENZHEN) CO., LTD.",
        "district": "futian",
        "cluster": "ai",
        "n": 18
      },
      {
        "name": "SHENZHEN MINDRAY BIO-MEDICAL ELECTRONICS CO., LTD.",
        "district": "futian",
        "cluster": "medtech",
        "n": 8
      }
    ],
    "longhua": [
      {
        "name": "MOBI ANTENNA TECHNOLOGIES (SHENZHEN) CO., LTD.",
        "district": "longhua",
        "cluster": "telecom",
        "n": 29
      },
      {
        "name": "MOBI ANTENNA TECHNOLOGIES（SHENZHEN）CO., LTD.",
        "district": "longhua",
        "cluster": null,
        "n": 1
      }
    ]
  }
};
